//accept invite endpoint 
import {NextRequest} from 'next/server';
import {db} from '@/lib/db';
import {getSession} from '@/lib/session';


export async function POST(req:NextRequest) {
    const {token} = await req.json();

    const existing = await db.invite.findFirst({where:{token}});

    if(!existing){
        return Response.json({error: 'Token not found'}, {status:400})
    }

    const now = new Date(); 

    if(now > existing.expiresAt){
        return Response.json({error: 'Token has expired'}, {status: 401})
    }

    const session = await getSession();

    if(!session) {
        return Response.json({error: 'There is no current session'}, {status:401});
    }

    const orgMember = await db.orgMember.findFirst({
        where: {userId: session.userId, orgId : existing.orgId} 
    });

    if(orgMember) { 
        return Response.json({error: 'Already an Organization Member, try to log in'},{status:409});
    }

    await db.$transaction([
        db.orgMember.create({
            data: {userId: session.userId, orgId: existing.orgId, role : 'member'}
        }),
        db.invite.delete({where:{id:existing.id}})
    ]);

    return Response.json({ok:true},{status:200});

}
