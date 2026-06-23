import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifySession } from '@/lib/dal';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
    const session = await verifySession();
    const { orgId } = await req.json();

    if (!orgId) {
        return Response.json({ error: 'orgId is required' }, { status: 400 });
    }

    const membership = await db.orgMember.findFirst({
        where: { userId: session.userId, orgId },
    });

    if (!membership) {
        return Response.json({ error: 'Not a member of this org' }, { status: 403 });
    }

    await createSession(session.userId, orgId);
    return Response.json({ ok: true });
}
