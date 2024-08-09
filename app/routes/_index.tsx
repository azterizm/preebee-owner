import { json, type LoaderArgs, type V2_MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export async function loader({}: LoaderArgs) {
  return json({})
}

export default function Index() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='font-bold text-3xl text-center'>Preebee Admin</h1>
        <Link to='/logout' className='btn btn-error'>Logout</Link>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 items-center justify-center mt-16 gap-4'>
        <Link to='/customers' className='btn btn-wide btn-primary'>
          Customers
        </Link>
        <Link to='/sellers' className='btn btn-wide btn-primary'>
          Sellers
        </Link>
        <Link to='/withdrawal_requests' className='btn btn-wide btn-primary'>
          Withdrawal Requests
        </Link>
        <Link to='/verifications' className='btn btn-wide btn-primary'>
          Verifications
        </Link>
      </div>
    </div>
  )
}
