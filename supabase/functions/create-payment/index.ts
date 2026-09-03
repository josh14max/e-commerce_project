import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_CART_LINES = 30;
const MAX_QUANTITY_PER_LINE = 10;
const SIZE_PRICE_SUPPLEMENT: Record<string, number> = {
  "12": 0,
  "16": 2000,
  "20": 4000,
  "22": 6000,
  "28": 9000,
  "30": 11000,
  "32": 13000,
};

interface CustomerPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
}

interface CartLinePayload {
  productId: string;
  variantValue: string;
  quantity: number;
}

interface CreatePaymentPayload {
  customer: CustomerPayload;
  items: CartLinePayload[];
  returnUrl: string;
}

interface MonerooResponse {
  message?: string;
  data?: {
    id?: string;
    checkout_url?: string;
  };
  errors?: unknown;
}

interface CheckoutConfig {
  depositAmount?: number;
  paymentMethods?: string[];
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number | string;
  images: string[] | null;
  colors: string[] | null;
  lengths: string[] | null;
  textures: string[] | null;
  is_active: boolean;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function isValidPayload(payload: unknown): payload is CreatePaymentPayload {
  if (!payload || typeof payload !== "object") return false;
  const { customer, items, returnUrl } = payload as Record<string, unknown>;
  if (!isNonEmptyString(returnUrl, 500) || !Array.isArray(items)) return false;
  if (items.length === 0 || items.length > MAX_CART_LINES) return false;
  if (!customer || typeof customer !== "object") return false;

  const customerRecord = customer as Record<string, unknown>;
  if (
    !isNonEmptyString(customerRecord.email, 254) ||
    !/^\S+@\S+\.\S+$/.test(customerRecord.email) ||
    !isNonEmptyString(customerRecord.first_name, 100) ||
    !isNonEmptyString(customerRecord.last_name, 100) ||
    !isNonEmptyString(customerRecord.phone, 40) ||
    !isNonEmptyString(customerRecord.country, 100)
  ) {
    return false;
  }

  return items.every((item) => {
    if (!item || typeof item !== "object") return false;
    const line = item as Record<string, unknown>;
    return (
      isNonEmptyString(line.productId, 150) &&
      typeof line.variantValue === "string" &&
      line.variantValue.length <= 500 &&
      Number.isInteger(line.quantity) &&
      Number(line.quantity) >= 1 &&
      Number(line.quantity) <= MAX_QUANTITY_PER_LINE
    );
  });
}

function safeReturnUrl(rawUrl: string, requestOrigin: string | null): URL | null {
  try {
    const url = new URL(rawUrl);
    const configuredSiteUrl = Deno.env.get("PAYMENT_SITE_URL");
    const allowedOrigin = configuredSiteUrl
      ? new URL(configuredSiteUrl).origin
      : requestOrigin
        ? new URL(requestOrigin).origin
        : null;
    const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);

    if ((!localHttp && url.protocol !== "https:") || !allowedOrigin || url.origin !== allowedOrigin) {
      return null;
    }
    if (url.pathname !== "/paiement/confirmation") return null;
    return url;
  } catch {
    return null;
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function sanitizeCartLine(line: CartLinePayload, product: ProductRow) {
  const parts = line.variantValue.split("__").filter(Boolean);
  const colors = stringArray(product.colors);
  const textures = stringArray(product.textures);
  const lengths = stringArray(product.lengths);
  const validValues = new Set([...colors, ...textures, ...lengths]);

  if (parts.some((part) => !validValues.has(part))) return null;

  const color = colors.find((option) => parts.includes(option)) ?? "";
  const texture = textures.find((option) => parts.includes(option)) ?? "";
  const length = lengths.find((option) => parts.includes(option)) ?? "";
  if ((colors.length > 0 && !color) || (textures.length > 0 && !texture) || (lengths.length > 0 && !length)) {
    return null;
  }

  const basePrice = Number(product.price);
  if (!Number.isFinite(basePrice) || basePrice <= 0) return null;
  const price = Math.round(basePrice + (product.category === "wigs" ? SIZE_PRICE_SUPPLEMENT[length] ?? 0 : 0));

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price,
    image: stringArray(product.images)[0] ?? "",
    category: product.category,
    variantLabel: [color, texture, length].filter(Boolean).join(" · "),
    variantValue: [color, texture, length].filter(Boolean).join("__"),
    quantity: line.quantity,
  };
}

async function getAuthenticatedUserId(
  adminClient: ReturnType<typeof createClient>,
  authorization: string | null,
): Promise<string | null> {
  const token = authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const { data, error } = await adminClient.auth.getUser(token);
    return error ? null : data.user?.id ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const secretKey = Deno.env.get("MONEROO_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secretKey || !supabaseUrl || !serviceRoleKey) {
    console.error("Payment service environment is not configured");
    return jsonResponse({ error: "Payment service unavailable" }, 500);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!isValidPayload(payload)) {
    return jsonResponse({ error: "Invalid checkout information" }, 400);
  }

  const returnUrl = safeReturnUrl(payload.returnUrl, req.headers.get("origin"));
  if (!returnUrl) {
    return jsonResponse({ error: "Invalid payment return URL" }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const productIds = [...new Set(payload.items.map((item) => item.productId))];
  const [{ data: productRows, error: productsError }, { data: settingsRow, error: settingsError }] = await Promise.all([
    adminClient
      .from("products")
      .select("id, slug, name, category, price, images, colors, lengths, textures, is_active")
      .in("id", productIds)
      .eq("is_active", true),
    adminClient
      .from("site_settings")
      .select("value")
      .eq("key", "checkout")
      .maybeSingle(),
  ]);

  if (productsError || settingsError || !settingsRow) {
    console.error("Unable to load authoritative checkout data", productsError?.message, settingsError?.message);
    return jsonResponse({ error: "Unable to prepare checkout" }, 500);
  }
  if (!productRows || productRows.length !== productIds.length) {
    return jsonResponse({ error: "One or more products are no longer available" }, 409);
  }

  const productsById = new Map((productRows as ProductRow[]).map((product) => [product.id, product]));
  const sanitizedItems = payload.items.map((line) => {
    const product = productsById.get(line.productId);
    return product ? sanitizeCartLine(line, product) : null;
  });
  if (sanitizedItems.some((item) => item === null)) {
    return jsonResponse({ error: "One or more product options are invalid" }, 409);
  }

  const orderItems = sanitizedItems.filter((item): item is NonNullable<typeof item> => item !== null);
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0 || subtotal > 99_999_999) {
    return jsonResponse({ error: "Invalid order total" }, 400);
  }

  const checkoutConfig = settingsRow.value as CheckoutConfig;
  const configuredDeposit = Number(checkoutConfig?.depositAmount);
  if (!Number.isFinite(configuredDeposit) || configuredDeposit <= 0) {
    return jsonResponse({ error: "Invalid payment configuration" }, 500);
  }
  const amount = Math.min(Math.round(configuredDeposit), subtotal);
  const allowedMethods = ["wave_ci", "orange_ci"];
  const methods = (checkoutConfig?.paymentMethods ?? allowedMethods)
    .filter((method) => allowedMethods.includes(method));
  if (methods.length === 0) {
    return jsonResponse({ error: "No payment method is enabled" }, 503);
  }

  const customer = {
    email: payload.customer.email.trim().toLowerCase(),
    first_name: payload.customer.first_name.trim(),
    last_name: payload.customer.last_name.trim(),
    phone: payload.customer.phone.trim(),
    country: payload.customer.country.trim(),
  };
  const userId = await getAuthenticatedUserId(adminClient, req.headers.get("authorization"));
  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .insert({
      user_id: userId,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      address: null,
      address_complement: null,
      city: null,
      postal_code: null,
      country: customer.country,
      phone: customer.phone,
      items: orderItems,
      subtotal,
      shipping: 0,
      total: subtotal,
      deposit_amount: amount,
      status: "pending",
      payment_provider: "moneroo",
    })
    .select("id, payment_access_token")
    .single();

  if (orderError || !order) {
    console.error("Unable to create order", orderError?.message);
    return jsonResponse({ error: "Unable to create order" }, 500);
  }

  returnUrl.searchParams.set("order_id", order.id);
  returnUrl.searchParams.set("access_token", order.payment_access_token);

  let monerooResponse: Response;
  try {
    monerooResponse = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "XOF",
        description: `Commande NG Hair #${order.id}`,
        return_url: returnUrl.toString(),
        customer: {
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
        },
        metadata: { order_id: order.id },
        methods,
      }),
    });
  } catch (error) {
    console.error("Moneroo API request failed", error);
    await adminClient.from("orders").update({ status: "payment_error" }).eq("id", order.id);
    return jsonResponse({ error: "Failed to reach payment provider" }, 502);
  }

  let monerooData: MonerooResponse;
  try {
    monerooData = await monerooResponse.json();
  } catch {
    await adminClient.from("orders").update({ status: "payment_error" }).eq("id", order.id);
    return jsonResponse({ error: "Invalid response from payment provider" }, 502);
  }
  if (!monerooResponse.ok) {
    await adminClient.from("orders").update({ status: "payment_error" }).eq("id", order.id);
    return jsonResponse(
      { error: monerooData.message ?? "Payment initialization failed", details: monerooData.errors ?? null },
      monerooResponse.status,
    );
  }

  const checkoutUrl = monerooData.data?.checkout_url;
  if (!checkoutUrl) {
    await adminClient.from("orders").update({ status: "payment_error" }).eq("id", order.id);
    return jsonResponse({ error: "Payment provider did not return a checkout URL" }, 502);
  }

  const { error: paymentUpdateError } = await adminClient
    .from("orders")
    .update({
      moneroo_transaction_id: monerooData.data?.id ?? null,
      payment_initialized_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "pending");
  if (paymentUpdateError) {
    console.error("Unable to store Moneroo payment reference", paymentUpdateError.message);
  }

  return jsonResponse({ checkout_url: checkoutUrl, amount });
});
