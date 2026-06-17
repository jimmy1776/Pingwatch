import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(req:NextRequest) {
    const {email,password} = await req.json()

    if (!email || !password) {
        return Response.json({error: 'Email and password are required'}, {status:400})
    }

    const user = await db.user.findUnique({where: {email}})
    if (!user || !user.passwordHash ){
        return Response.json({error: 'Invalid credentials'}, {status:401})
    }

    const valid = await bcrypt.compare(password,user.passwordHash)
    if (!valid) {
        return Response.json({error: 'Invalid crendetials'}, {status : 401})
    }

    const membership = await db.orgMember.findFirst({ where: { userId: user.id } })
    if (!membership) {
        return Response.json({ error: 'No organization found for user' }, { status: 500 })
    }

    await createSession(user.id, membership.orgId)
    return Response.json({ok:true})
}