import { Authenticator } from 'remix-auth'
import { sessionStorage } from './session.server'
import { FormStrategy } from 'remix-auth-form'
import invariant from 'tiny-invariant'

export let authenticator = new Authenticator<{ admin: Boolean }>(sessionStorage)

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let input = form.get('key')

    const key = process.env.ADMIN_KEY
    invariant(key, 'ADMIN_KEY is not set')
    if (input !== key) {
      throw new Error('Invalid key')
    }

    return { admin: true }
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass',
)
