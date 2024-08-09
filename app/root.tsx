import { cssBundleHref } from '@remix-run/css-bundle'
import { type LinksFunction, type LoaderArgs, redirect } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import globalCssURL from './styles/global.css'
import { useEffect } from 'react'
import { authenticator } from './auth.server'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: globalCssURL },
  { rel: 'stylesheet', href: '/general-sans.css' },
]

export async function loader({ request }: LoaderArgs) {
  const result = await authenticator.isAuthenticated(request)
  if (!result && !request.url.endsWith('/login')) {
    return redirect('/login')
  }
  return null
}

export default function App() {
  useEffect(() => {
    localStorage.setItem('theme', 'light')
  }, [])
  return (
    <html lang='en' className='light'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
