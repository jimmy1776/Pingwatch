import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function syncSubscription(sub: Stripe.Subscription, orgId: string) {
  const item = sub.items.data[0]
  const priceId = item.price.id
  const plan =
    priceId === process.env.STRIPE_PRICE_PRO ? 'pro'
    : priceId === process.env.STRIPE_PRICE_BUSINESS ? 'business'
    : 'free'

  // Stripe SDK v22 (API 2026+) removed current_period_end from the TS types.
  // It may still exist at runtime on the sub or item; fall back to 30 days if not.
  const subRaw = sub as unknown as Record<string, unknown>
  const itemRaw = item as unknown as Record<string, unknown>
  const periodEndTs =
    (typeof subRaw.current_period_end === 'number' ? subRaw.current_period_end : null) ??
    (typeof itemRaw.current_period_end === 'number' ? itemRaw.current_period_end : null) ??
    Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

  await db.subscription.upsert({
    where: { orgId },
    create: {
      orgId,
      stripeCustomerId: sub.customer as string,
      stripePriceId: priceId,
      plan,
      status: sub.status,
      currentPeriodEnd: new Date(periodEndTs * 1000),
    },
    update: {
      stripePriceId: priceId,
      plan,
      status: sub.status,
      currentPeriodEnd: new Date(periodEndTs * 1000),
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.orgId
      if (!orgId) return Response.json({ error: 'No orgId in metadata' }, { status: 400 })
      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      await syncSubscription(sub, orgId)
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object as Stripe.Subscription
      const existing = await db.subscription.findFirst({
        where: { stripeCustomerId: sub.customer as string },
      })
      if (existing) {
        await syncSubscription(sub, existing.orgId)
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[webhook] error:', message)
    return Response.json({ error: message }, { status: 500 })
  }

  return Response.json({ received: true })
}
