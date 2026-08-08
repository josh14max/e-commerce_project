import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CustomerPayload {
  email: string;
  first_name: string;
  last_name: string;
}

interface CreatePaymentPayload {
  amount: number;
  currency: string;
  customer: CustomerPayload;
  orderId: string;
  returnUrl: string;
}

interface MonerooResponse {
  message?: string;
  data?: {
    checkout_url?: string;
  };
  errors?: unknown;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidPayload(payload: unknown): payload is CreatePaymentPayload {
  if (!payload || typeof payload !== "object") return false;

  const { amount, currency, customer, orderId, returnUrl } =
    payload as Record<string, unknown>;

  if (typeof amount !== "number" || amount <= 0) return false;
  if (typeof currency !== "string" || currency.trim() === "") return false;
  if (typeof orderId !== "string" || orderId.trim() === "") return false;
  if (typeof returnUrl !== "string" || returnUrl.trim() === "") return false;
  if (!customer || typeof customer !== "object") return false;

  const { email, first_name, last_name } = customer as Record<string, unknown>;
  return (
    typeof email === "string" &&
    email.trim() !== "" &&
    typeof first_name === "string" &&
    first_name.trim() !== "" &&
    typeof last_name === "string" &&
    last_name.trim() !== ""
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const secretKey = Deno.env.get("MONEROO_SECRET_KEY");
  if (!secretKey) {
    console.error("MONEROO_SECRET_KEY is not configured");
    return jsonResponse({ error: "Payment service unavailable" }, 500);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!isValidPayload(payload)) {
    return jsonResponse(
      {
        error:
          "Missing or invalid fields: amount, currency, customer (email, first_name, last_name), orderId, returnUrl",
      },
      400,
    );
  }

  const { amount, currency, customer, orderId, returnUrl } = payload;

  let monerooResponse: Response;
  try {
    monerooResponse = await fetch(
      "https://api.moneroo.io/v1/payments/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          description: `Commande NGE Hair #${orderId}`,
          return_url: returnUrl,
          customer: {
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name,
          },
          metadata: { order_id: orderId },
          methods: ["wave_ci", "orange_ci"],
        }),
      },
    );
  } catch (error) {
    console.error("Moneroo API request failed:", error);
    return jsonResponse({ error: "Failed to reach payment provider" }, 502);
  }

  let monerooData: MonerooResponse;
  try {
    monerooData = await monerooResponse.json();
  } catch {
    console.error(
      "Moneroo API returned a non-JSON response with status",
      monerooResponse.status,
    );
    return jsonResponse({ error: "Invalid response from payment provider" }, 502);
  }

  if (!monerooResponse.ok) {
    return jsonResponse(
      {
        error: monerooData.message ?? "Payment initialization failed",
        details: monerooData.errors ?? null,
      },
      monerooResponse.status,
    );
  }

  const checkoutUrl = monerooData.data?.checkout_url;
  if (!checkoutUrl) {
    console.error("Moneroo response missing checkout_url");
    return jsonResponse(
      { error: "Payment provider did not return a checkout URL" },
      502,
    );
  }

  return jsonResponse({ checkout_url: checkoutUrl });
});
