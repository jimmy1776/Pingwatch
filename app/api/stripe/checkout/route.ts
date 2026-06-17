// This endpoint creates a Stripe Checkout sessions and returns the URL to redirect the user to 
import{NextRequest} from 'next/server';
import {getSession} from '@/lib/session'; 
import {Stripe} from 'stripe'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); 

export async function POST(req:NextRequest) {

    const currentSession = await getSession();
    
    const{plan} = await req.json(); 

    if(!currentSession) { 
        return Response.json({error:"Unauthorized"},{status:401});
    }

    const priceId = plan == "pro" ? process.env.STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_BUSINESS;

    if(!priceId) { 
        return Response.json({error:'Invalid plan'},{status:400}); 
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription', 
        line_items : [{price:priceId,quantity:1}],
        success_url : `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
        cancel_url : `${process.env.NEXTAUTH_URL}/dashboard`,
        metadata: {orgId: currentSession.orgId},
    });

    return Response.json({url:checkoutSession.url},{status:200});









}



































