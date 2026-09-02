import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

interface MonerooWebhookData {
  id?: string;
  metadata?: { order_id?: string };
}

interface MonerooWebhookPayload {
  type?: string;
  event?: string;
  data?: MonerooWebhookData;
}

function textResponse(message: string, status: number): Response {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

async function verifySignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const normalizedSignature = signature.trim().toLowerCase().replace(/^sha256=/, "");
  if (!/^[0-9a-f]{64}$/.test(normalizedSignature)) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  let mismatch = 0;
  for (let index = 0; index < computed.length; index += 1) {
    mismatch |= computed.charCodeAt(index) ^ normalizedSignature.charCodeAt(index);
  }
  return mismatch === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return textResponse("Method not allowed", 405);

  const webhookSecret = Deno.env.get("MONEROO_WEBHOOK_SECRET");
  const monerooSecretKey = Deno.env.get("MONEROO_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!webhookSecret || !monerooSecretKey || !supabaseUrl || !serviceRoleKey) {
    console.error("Moneroo webhook environment is not configured");
    return textResponse("Webhook unavailable", 500);
  }

  const rawBody = await req.text();
  if (!(await verifySignature(rawBody, req.headers.get("x-moneroo-signature"), webhookSecret))) {
    console.error("Invalid Moneroo webhook signature");
    return textResponse("Invalid signature", 403);
  }

  let payload: MonerooWebhookPayload;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object") return textResponse("Invalid JSON payload", 400);
    payload = parsed as MonerooWebhookPayload;
  } catch {
    return textResponse("Invalid JSON", 400);
  }

  const eventType = payload.type ?? payload.event;
  if (!eventType || !["payment.success", "payment.failed", "payment.cancelled"].includes(eventType)) {
    return textResponse("Ignored", 200);
  }

  const paymentId = payload.data?.id;
  const webhookOrderId = payload.data?.metadata?.order_id;
  if (!paymentId || !webhookOrderId) {
    console.error("Moneroo webhook is missing its payment or order reference");
    return textResponse("Missing payment information", 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .select("id, status, deposit_amount, moneroo_transaction_id")
    .eq("id", webhookOrderId)
    .maybeSingle();

  if (orderError) {
    console.error("Unable to load webhook order", orderError.message);
    return textResponse("Temporary database error", 500);
  }
  if (!order) return textResponse("Unknown order", 404);
  if (order.status === "paid") {
    return order.moneroo_transaction_id === paymentId
      ? textResponse("Already processed", 200)
      : textResponse("Payment reference conflict", 409);
  }

  if (eventType === "payment.success") {
    let verifyResponse: Response;
    try {
      verifyResponse = await fetch(
        `https://api.moneroo.io/v1/payments/${encodeURIComponent(paymentId)}/verify`,
        { headers: { Authorization: `Bearer ${monerooSecretKey}`, Accept: "application/json" } },
      );
    } catch (error) {
      console.error("Unable to reach Moneroo verification API", error);
      return textResponse("Temporary verification error", 500);
    }
    if (!verifyResponse.ok) {
      console.error("Moneroo verification API rejected the request", verifyResponse.status);
      return textResponse("Temporary verification error", 500);
    }

    const verifyJson = await verifyResponse.json();
    const verifiedPayment = verifyJson?.data;
    const verifiedStatus = String(verifiedPayment?.status ?? "").toLowerCase();
    const verifiedOrderId = verifiedPayment?.metadata?.order_id;
    const verifiedAmount = Number(verifiedPayment?.amount);
    const verifiedCurrency = String(verifiedPayment?.currency ?? "").toUpperCase();
    if (
      verifiedStatus !== "success" ||
      verifiedOrderId !== order.id ||
      verifiedAmount !== Number(order.deposit_amount) ||
      verifiedCurrency !== "XOF"
    ) {
      console.error("Verified Moneroo payment does not match the order");
      return textResponse("Payment verification mismatch", 422);
    }

    const { error: updateError } = await adminClient
      .from("orders")
      .update({
        status: "paid",
        moneroo_transaction_id: paymentId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .neq("status", "paid");
    if (updateError) {
      console.error("Unable to confirm paid order", updateError.message);
      return textResponse("Temporary database error", 500);
    }
    return textResponse("OK", 200);
  }

  const nextStatus = eventType === "payment.cancelled" ? "cancelled" : "failed";
  const { error: updateError } = await adminClient
    .from("orders")
    .update({ status: nextStatus, moneroo_transaction_id: paymentId })
    .eq("id", order.id)
    .neq("status", "paid");
  if (updateError) {
    console.error("Unable to update unsuccessful payment", updateError.message);
    return textResponse("Temporary database error", 500);
  }

  return textResponse("OK", 200);
});
