import {NextRequest} from 'next/server';
import Stripe from 'stripe';
import {db} from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req:NextRequest) { 
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try{
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!); 
    } catch{ 
        return Response.json({error:'Invalid Signature'},{status:400});
    }

    if(event.type == 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId!;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        await db.subscription.upsert({
            where : {orgId},
            create:{
                orgId,
                stripeCustomerId: session.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                plan: subscription.items.data[0].price.id === process.env.STRIPE_PRICE_PRO ? 'pro' : 'business',
                status : subscription.status,
                currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
            },
            update: { 
                status: subscription.status, 
                stripePriceId: subscription.items.data[0].price.id,
                plan: subscription.items.data[0].price.id === process.env.STRIPE_PRICE_PRO ? 'pro' : 'business',
                currentPeriodEnd : new Date(subscription.items.data[0].current_period_end *1000), 
            },
        });
    }

    return Response.json({received: true}, {status:200});

}


























































