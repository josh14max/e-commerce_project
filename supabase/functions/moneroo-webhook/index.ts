import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MONEROO_WEBHOOK_SECRET = Deno.env.get('MONEROO_WEBHOOK_SECRET')!
const MONEROO_SECRET_KEY = Deno.env.get('MONEROO_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface MonerooWebhookData {
  id?: string
  metadata?: { order_id?: string }
}

interface MonerooWebhookPayload {
  event?: string
  data?: MonerooWebhookData
}

async function verifySignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(MONEROO_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  if (computed.length !== signature.length) return false
  let mismatch = 0
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return mismatch === 0
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-moneroo-signature')

  if (!(await verifySignature(rawBody, signature))) {
    console.error('Signature Moneroo invalide')
    return new Response('Invalid signature', { status: 403 })
  }

  let payload: MonerooWebhookPayload
  try {
    const parsed: unknown = JSON.parse(rawBody)
    if (!parsed || typeof parsed !== 'object') {
      return new Response('Invalid JSON payload', { status: 400 })
    }
    payload = parsed as MonerooWebhookPayload
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const event = payload.event
  const data = payload.data
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    if (event === 'payment.success') {
      const orderId = data?.metadata?.order_id
      if (orderId) {
        const verifyRes = await fetch(`https://api.moneroo.io/v1/payments/${data.id}/verify`, {
          headers: { Authorization: `Bearer ${MONEROO_SECRET_KEY}`, Accept: 'application/json' },
        })
        const verifyJson = await verifyRes.json()
        if (verifyJson?.data?.status === 'success') {
          await supabase
            .from('orders')
            .update({ status: 'paid', moneroo_transaction_id: data.id })
            .eq('id', orderId)
        } else {
          console.error('Vérification Moneroo non concluante', verifyJson)
        }
      }
    } else if (event === 'payment.failed') {
      const orderId = data?.metadata?.order_id
      if (orderId) {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId)
      }
    }
  } catch (err) {
    console.error('Erreur de traitement webhook Moneroo', err)
  }

  return new Response('OK', { status: 200 })
})
