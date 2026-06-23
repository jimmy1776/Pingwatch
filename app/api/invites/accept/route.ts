import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
    const { token } = await req.json();

    const invite = await db.invite.findFirst({ where: { token } });

    if (!invite) {
        return Response.json({ error: 'Invalid invite token' }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
        return Response.json({ error: 'Invite has expired' }, { status: 410 });
    }

    const session = await getSession();
    if (!session) {
        return Response.json({ error: 'You must be logged in to accept an invite' }, { status: 401 });
    }

    const alreadyMember = await db.orgMember.findFirst({
        where: { userId: session.userId, orgId: invite.orgId },
    });

    if (alreadyMember) {
        return Response.json({ error: 'Already a member of this organization' }, { status: 409 });
    }

    await db.$transaction([
        db.orgMember.create({
            data: { userId: session.userId, orgId: invite.orgId, role: 'member' },
        }),
        db.invite.delete({ where: { id: invite.id } }),
    ]);

    return Response.json({ ok: true, orgId: invite.orgId }, { status: 200 });
}
