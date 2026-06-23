import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function syncSubscription(sub: Stripe.Subscription, orgId: string) {
  const priceId = sub.items.data[0].price.id
  const plan =
    priceId === process.env.STRIPE_PRICE_PRO ? 'pro'
    : priceId === process.env.STRIPE_PRICE_BUSINESS ? 'business'
    : 'free'

  await db.subscription.upsert({
    where: { orgId },
    create: {
      orgId,
      stripeCustomerId: sub.customer as string,
      stripePriceId: priceId,
      plan,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    },
    update: {
      stripePriceId: priceId,
      plan,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
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

  return Response.json({ received: true })
}
