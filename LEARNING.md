# Learning Log

Conceptual questions asked during PingWatch development.

---

## 2026-06-11

**Q: What does `req: NextRequest` mean?**
TypeScript type annotation — tells the editor that `req` is a `NextRequest` object. Doesn't affect runtime behavior. Enables autocomplete and catches misuse at compile time. Without it, `req` is typed as `any` and you lose editor help.

---

**Q: What is a NextRequest object?**
A container Next.js creates from an incoming HTTP request. Holds everything about the request: `req.json()` (body), `req.headers`, `req.url`, `req.method`, `req.cookies`. Next.js builds it automatically and passes it to your route handler. Built on top of the browser's standard `Request` object with extra Next.js-specific features added.

---

**Q: What is the point of async/await and Promises?**
Your server handles many requests at once. When your code talks to something external (database, email service, API), it has to wait for a response. `await` lets Node pause *that function* and handle other requests while waiting, instead of blocking everything. A **Promise** is the object representing "a value not here yet." `async/await` is cleaner syntax for working with Promises — `await` unwraps them. Rule of thumb: anything outside your code (DB, API, file system) returns a Promise and needs `await`.

---

**Q: Does `await` actually pause the function, or does it work in the background?**
It's the latter. When Node hits an `await`, it sends the external request out, sets that function aside, and goes to handle other work (other requests, callbacks, etc.). When the response comes back, it picks the function back up where it left off. So "pause" means paused from *your function's perspective* — your code stops at that line — but Node itself never stops. This is called **non-blocking I/O**. Node is single-threaded (one waiter) but efficient because it never stands around waiting. Analogy: a restaurant waiter takes your order, sends it to the kitchen, then serves other tables. When the kitchen is done, they come back to you. The waiter never paused — your order was just on hold.

---

## 2026-06-13

**Q: What is `NEXTAUTH_URL`?**
Just a base URL environment variable — the full domain where your app lives (e.g. `http://localhost:3000` in dev, `https://pingwatch.vercel.app` in production). The name comes from the NextAuth.js convention, but it's not magic — it's a plain string. Used here to build a full clickable link in the invite email: `${NEXTAUTH_URL}/invite/accept?token=abc123`.

---

**Q: Why isn't the invite token encrypted with a secret?**
Because it doesn't need to be — the token *is* the credential. `crypto.randomBytes(32)` generates 256 bits of random data, which is unguessable. The security model is: store it in the DB, email the link, look it up when the user clicks it. If it matches an unexpired row, the invite is valid. Encryption (e.g. signing a JWT) is for a *stateless* pattern where you embed data inside the token so you skip the DB lookup. The DB-backed random token is actually better for invites because you can revoke it by deleting the row — a JWT can't be revoked without extra infrastructure.

---

**Q: What are the parts of an HTTP request?**
Every HTTP request is made up of: method, URL, headers, body, and sometimes query params.

- **Method** — GET, POST, PATCH, DELETE
- **URL** — the path + query string (e.g. `/api/orgs/abc123/monitors?active=true`)
- **Headers** — metadata like `Content-Type: application/json`, auth tokens, etc.
- **Body** — the JSON payload, only on POST/PATCH (GET and DELETE don't have one)
- **Query params** — key-value pairs in the URL after `?`, e.g. `?active=true`

---

**Q: What is a cron job?**
A task that runs automatically on a schedule. In PingWatch, Vercel calls your `/api/cron/ping` endpoint every minute (or whatever interval you set) without any user triggering it. It's how PingWatch actually checks if sites are up — not when a user clicks something, but continuously in the background on a timer.

---

## 2026-06-17

**Q: What does a try/catch block do?**
Lets you handle errors gracefully instead of crashing. Without it, if something like `db.invite.create` fails (DB down, network error), the error bubbles up unhandled and your server returns a confusing response or crashes.

```ts
try {
    // code that might fail
    await db.invite.create({ data: { email, orgId, token, expiresAt } })
} catch (error) {
    // runs only if the try block threw an error
    return Response.json({ error: 'Failed to create invite' }, { status: 500 })
}
```

- **try** — run this code, and if anything throws, stop immediately and jump to catch
- **catch** — here's what to do when that happens (log it, return an error response, etc.)

The `error` variable holds whatever was thrown — usually an `Error` object with a `.message` property you can log. Common pattern: wrap all route handler logic in a try/catch and return a 500 if anything goes wrong.

---

**Q: What is a webhook?**
A way for an external service (Stripe in this case) to notify your app when something happens on their end.

The flow:
1. User clicks "Upgrade to Pro" → your app sends them to Stripe's checkout page
2. User enters their card and pays on Stripe's site
3. Stripe processes the payment and calls your API at `/api/stripe/webhook` to say "hey, this user just subscribed"
4. Your webhook handler receives that notification and updates the `Subscription` table in your DB

You can't trust the frontend to tell you "the payment went through" — that's easy to fake. The webhook comes directly from Stripe's servers, which is why it's the source of truth for subscription state.



