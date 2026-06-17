// create a monitor endpoint 
// model takes the fields: url, intervalSecs, orgId(comes the URL params, not the request body)
import{NextRequest} from 'next/server'; 
import {db} from '@/lib/db';
import{requireOrgRole} from '@/lib/dal'

export async function POST(req: NextRequest , {params} : {params: Promise <{orgId:string}> }) {
    const {orgId} = await params; 

    const orgRole = await requireOrgRole('member', orgId); 

    const {url,intervalSecs} = await req.json();

    if (!url) {
    return Response.json({ error: 'URL is required' }, { status: 400 });
    }  

    if (!intervalSecs) {
    return Response.json({ error: 'Interval is required' }, { status: 400 });
    }

    const subscription = await db.subscription.findUnique({ where: { orgId } });
    const plan = subscription?.plan ?? 'free';

    const limits: Record<string, number> = { free: 3, pro: 20, business: Infinity };
    const limit = limits[plan];

    const monitorCount = await db.monitor.count({ where: { orgId } });
    if (monitorCount >= limit) {
        return Response.json({ error: `Your ${plan} plan allows a maximum of ${limit} monitors. Upgrade to add more.` }, { status: 403 });
    }

    await db.monitor.create({
        data : {url : url, intervalSecs:intervalSecs,orgId: orgId}
    }) 

    return Response.json({ok:true}, {status: 201});
    

}





