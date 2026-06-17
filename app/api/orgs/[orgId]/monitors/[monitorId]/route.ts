import {NextRequest} from 'next/server'; 
import {db} from '@/lib/db'; 
import {requireOrgRole}  from '@/lib/dal'; 

export async function GET(req:NextRequest, {params}:{params:Promise<{orgId:string, monitorId: string}>}) {
    const {orgId,monitorId} = await params; 

    const orgRole = await requireOrgRole('member',orgId); 

    const monitor = await db.monitor.findFirst({where:{id:monitorId,orgId}})

    if(!monitor) { 
        return Response.json({error: 'monitor does not exist'}, {status:404});
    } 

    return Response.json(monitor,{status:200});

}


export async function PATCH(req:NextRequest, {params}:{params:Promise<{orgId:string,monitorId:string}>}) { 
    const {orgId,monitorId} = await params;

    const orgRole = await requireOrgRole('member',orgId); 

    const {url,intervalSecs} = await req.json(); 

   await db.monitor.update({where:{id:monitorId}, data:{url,intervalSecs}});

   return Response.json({ok:true}, {status:200}); 

}


export async function DELETE(req:NextRequest, {params}:{params:Promise<{orgId:string,monitorId:string}>}) {
    const {orgId,monitorId} = await params;

    // only admins can delete
    const orgRole = await requireOrgRole('admin', orgId);
    
    await db.monitor.delete({where:{id:monitorId}}); 

    return Response.json({ok:true},{status:200});    

}




