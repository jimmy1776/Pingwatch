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
    return Response.json({ error: 'No active subscription' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  })

  return Response.json({ url: portalSession.url })
}
