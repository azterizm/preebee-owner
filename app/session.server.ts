import { createCookieSessionStorage } from '@remix-run/node'
import invariant from 'tiny-invariant'

const cookieSecret = process.env.COOKIE_SECRET
invariant(cookieSecret, 'COOKIE_SECRET is not set')
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [cookieSecret], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
})

export let { getSession, commitSession, destroySession } = sessionStorage
