  import 'server-only'
  import { SignJWT, jwtVerify } from 'jose'
  import { cookies } from 'next/headers'

  type SessionPayload = {
    userId: string
    orgId: string
    expiresAt: Date
  }

//  So the full flow is: login → createSession() → cookie stored → every request calls getSession() → logout calls
//deleteSession(). 


  function getKey() {
    const secret = process.env.SESSION_SECRET
    if (!secret) throw new Error('SESSION_SECRET is not set')
    return new TextEncoder().encode(secret)
  }

  export async function encrypt(payload: SessionPayload): Promise<string> {
    return new SignJWT({ userId: payload.userId, orgId: payload.orgId ,expiresAt: payload.expiresAt.toISOString() })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getKey())
  }

  export async function decrypt(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
      return {
        userId: payload.userId as string,
        orgId: payload.orgId as string,
        expiresAt: new Date(payload.expiresAt as string),
      }
    } catch {
      return null
    }
  }

  export async function createSession(userId: string, orgId:string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const token = await encrypt({ userId,expiresAt, orgId })
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
  }

  export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('session')
  }

  export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    return decrypt(token)
  }
  









