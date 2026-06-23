import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json()

  const priceId =
    plan === 'pro' ? process.env.STRIPE_PRICE_PRO
    : plan === 'business' ? process.env.STRIPE_PRICE_BUSINESS
    : null

  if (!priceId) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  })

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user?.email,
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    metadata: { orgId: session.orgId },
  })

  return Response.json({ url: checkoutSession.url })
}
