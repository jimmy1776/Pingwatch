import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireOrgRole } from '@/lib/dal';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const { orgId } = await params;
    await requireOrgRole('admin', orgId);

    const { email } = await req.json();
    if (!email) {
        return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const existing = await db.invite.findFirst({ where: { email, orgId } });
    if (existing) {
        return Response.json({ error: 'Invite already sent to this email' }, { status: 409 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await db.invite.create({ data: { email, orgId, token, expiresAt } });

    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'You have been invited to PingWatch',
        html: `<a href="${process.env.NEXTAUTH_URL}/invite/accept?token=${token}">Accept your invite</a>`,
    });

    return Response.json({ ok: true }, { status: 201 });
}
