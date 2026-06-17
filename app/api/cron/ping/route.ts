import {db} from '@/lib/db';
import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req:NextRequest){
    //fetch all active monitors from the database
    const activeMonitors = await db.monitor.findMany({where:{active:true}});

    for(const monitor of activeMonitors){
        const start = Date.now(); 
        let ok = false; 
        let statusCode: number | null = null;

        try{
            const res = await fetch(monitor.url);
            statusCode = res.status;
            ok = res.ok;
        } catch { 
            ok = false; 
        }

        const latencyMs = Date.now() - start ; 

        await db.monitorCheck.create({
            data :{monitorId:monitor.id,ok,statusCode,latencyMs}
        });

        const openIncident = await db.incident.findFirst({
            where: { monitorId: monitor.id, resolvedAt: null }
        })
        if (!ok && !openIncident) {
            await db.incident.create({
                data: { monitorId: monitor.id }
            });
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'delivered@resend.dev',
                subject: `Down alert: ${monitor.url}`,
                html: `<p>Your monitor for <strong>${monitor.url}</strong> is down.</p>`
            });
        }

        if (ok && openIncident) {
            await db.incident.update({
                where: { id: openIncident.id },
                data: { resolvedAt: new Date() }
            });
        }

    }
    return Response.json({ok:true},{status:200});

}




