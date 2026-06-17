//dal: data access layer: the single place whewre you verify: is there a logged-in user? before touching any data 
import 'server-only'
import {cache} from 'react'
import {redirect} from 'next/navigation'
import {getSession} from './session'
import {db} from './db'

export const verifySession = cache(async() => {
    const session = await getSession()
    if (!session?.userId) redirect ('/login')
    return session
})

export const getCurrentUser = cache(async ()=>{
    const session = await getSession()
    if (!session?.userId) return null
    return db.user.findUnique({
        where:{id: session.userId},
        select : {id :true, email:true, createdAt:true}
    })
})

const ROLE_RANK: Record<string, number> = { 
    member: 0,
    admin: 1,
    owner :2 
}

export const requireOrgRole = cache(async(minimumRole: 'member' | 'admin' | 'owner', orgId: string) => {
    const session = await verifySession()
    const membership = await db.orgMember.findFirst({
        where: {userId : session.userId, orgId},
    })
    if (!membership || ROLE_RANK [membership.role] < ROLE_RANK[minimumRole]) { 
        redirect ('/dashboard')
    }
    return membership 
    
})


