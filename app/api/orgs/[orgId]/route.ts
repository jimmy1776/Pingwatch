import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireOrgRole } from '@/lib/dal';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const { orgId } = await params;
    await requireOrgRole('member', orgId);

    const org = await db.organization.findUnique({
        where: { id: orgId },
        select: {
            id: true,
            name: true,
            createdAt: true,
            members: {
                select: {
                    id: true,
                    role: true,
                    user: { select: { id: true, email: true } },
                },
            },
        },
    });

    if (!org) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(org);
}
