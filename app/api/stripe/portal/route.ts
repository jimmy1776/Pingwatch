import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(_req: NextRequest) {
  const session = await verifySession()

  const subscription = await db.subscription.findUnique({
    where: { orgId: session.orgId },
  })

  if (!subscription || subscription.status !== 'active') {
    return Response.json({ error: 'No active subscription found' }, { status: 404 })
  }

  if (!subscription.stripeCustomerId) {
    return Response.json({ error: 'No Stripe customer linked to this account' }, { status: 400 })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    })
    return Response.json({ url: portalSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return Response.json({ error: message }, { status: 500 })
  }
}
