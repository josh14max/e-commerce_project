import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface StatusPayload {
  orderId: string;
  accessToken: string;
}

interface OrderRecord {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  items: unknown[];
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  deposit_amount: number | string;
  status: string;
  moneroo_transaction_id: string | null;
  created_at: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidPayload(value: unknown): value is StatusPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.orderId === "string" &&
    uuidPattern.test(payload.orderId) &&
    typeof payload.accessToken === "string" &&
    uuidPattern.test(payload.accessToken)
  );
}

function normalizeStatus(status: string): "pending" | "paid" | "failed" | "cancelled" {
  const normalized = status.toLowerCase();
  if (normalized === "paid" || normalized === "success" || normalized === "completed") return "paid";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  if (normalized === "failed" || normalized === "payment_error") return "failed";
  return "pending";
}

async function reconcileWithMoneroo(
  adminClient: ReturnType<typeof createClient>,
  order: OrderRecord,
  secretKey: string | undefined,
): Promise<OrderRecord> {
  if (normalizeStatus(order.status) !== "pending" || !order.moneroo_transaction_id || !secretKey) {
    return order;
  }

  try {
    const response = await fetch(
      `https://api.moneroo.io/v1/payments/${encodeURIComponent(order.moneroo_transaction_id)}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}`, Accept: "application/json" } },
    );
    if (!response.ok) {
      console.error("Moneroo status reconciliation failed", response.status);
      return order;
    }

    const result = await response.json();
    const payment = result?.data;
    const providerStatus = normalizeStatus(String(payment?.status ?? "pending"));
    if (providerStatus === "pending") return order;

    const verifiedOrderId = payment?.metadata?.order_id;
    if (verifiedOrderId !== order.id) {
      console.error("Moneroo metadata does not match the order");
      return order;
    }

    if (providerStatus === "paid") {
      const amount = Number(payment?.amount);
      const currency = String(payment?.currency ?? "").toUpperCase();
      if (amount !== Number(order.deposit_amount) || currency !== "XOF") {
        console.error("Moneroo amount or currency does not match the order");
        return order;
      }
    }

    const nextStatus = providerStatus === "paid" ? "paid" : providerStatus;
    const update = providerStatus === "paid"
      ? { status: nextStatus, paid_at: new Date().toISOString() }
      : { status: nextStatus };
    const { data, error } = await adminClient
      .from("orders")
      .update(update)
      .eq("id", order.id)
      .neq("status", "paid")
      .select("id, email, first_name, last_name, address, city, country, phone, items, subtotal, shipping, total, deposit_amount, status, moneroo_transaction_id, created_at")
      .maybeSingle();

    if (error) {
      console.error("Unable to reconcile order status", error.message);
      return order;
    }
    return (data as OrderRecord | null) ?? order;
  } catch (error) {
    console.error("Unable to query Moneroo payment status", error);
    return order;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Payment status service unavailable" }, 500);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!isValidPayload(payload)) return jsonResponse({ error: "Invalid confirmation information" }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await adminClient
    .from("orders")
    .select("id, email, first_name, last_name, address, city, country, phone, items, subtotal, shipping, total, deposit_amount, status, moneroo_transaction_id, created_at")
    .eq("id", payload.orderId)
    .eq("payment_access_token", payload.accessToken)
    .maybeSingle();

  if (error) {
    console.error("Unable to load payment status", error.message);
    return jsonResponse({ error: "Unable to load payment status" }, 500);
  }
  if (!data) return jsonResponse({ error: "Confirmation not found" }, 404);

  const order = await reconcileWithMoneroo(
    adminClient,
    data as OrderRecord,
    Deno.env.get("MONEROO_SECRET_KEY"),
  );

  return jsonResponse({
    status: normalizeStatus(order.status),
    order: {
      id: order.id,
      email: order.email,
      first_name: order.first_name,
      last_name: order.last_name,
      address: order.address,
      city: order.city,
      country: order.country,
      phone: order.phone,
      items: order.items,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      deposit_amount: Number(order.deposit_amount),
      status: normalizeStatus(order.status),
      created_at: order.created_at,
    },
  });
});
