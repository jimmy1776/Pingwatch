import {NextRequest} from 'next/server'
import bcrypt from 'bcryptjs'
import {db} from '@/lib/db'
import {createSession} from '@/lib/session'
import type { PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'

type TransactionClient = Omit<PrismaClient, ITXClientDenyList>

export async function POST(req: NextRequest) {
    const {email,password} = await req.json()

    if(!email || !password) {
        return Response.json({error: 'Email and password are required'}, {status: 400})
    }

    const existing = await db.user.findUnique({where: {email}})
    if (existing) {
        return Response.json({error: 'Email already registered'}, {status :409 })
    }

    const passwordHash = await bcrypt.hash(password,12)

    const {user,org} = await db.$transaction(async (tx: TransactionClient) => {
        const newUser = await tx.user.create({data:{email,passwordHash}})
        const org = await tx.organization.create({ data: { name: `${email.split('@')[0]}'s workspace` } })
        await tx.orgMember.create({data:{userId: newUser.id,orgId: org.id, role:'owner'}})
        await tx.subscription.create({
            data:{
                orgId: org.id,
                stripeCustomerId: '',
                stripePriceId:'',
                plan: 'free',
                status : 'active',
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 *1000),
            },
        })
        return {user:newUser,org}
    })

    await createSession(user.id, org.id)
    return Response.json({ok:true},{status:201})

}





























