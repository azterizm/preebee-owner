import { json, LoaderArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import GoBack from '~/components/GoBack'
import { getRiderById } from '~/models/rider.server'

export async function loader({ params }: LoaderArgs) {
  const id = params.riderId
  if (!id) return redirect('/')
  const rider = await getRiderById(id)
  return json({ rider: _.omit(rider, ['passwordHash', 'updatedAt']) })
}

export default function Jobs() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <div className='relative'>
        <h1 className='text-center text-3xl font-bold'>Jobs</h1>
        <GoBack />
      </div>
      <div className='text-left mt-8'>
        <p className='text-lg font-medium'>Selected rider</p>
        {Object.keys(data.rider || {}).map((r) => (
          <div className='flex items-center gap-2'>
            <p className='font-normal'>
              <span className='capitalize'>{r}</span>: {(data as any).rider[r]}
            </p>
          </div>
        ))}
      </div>
      <div className='my-8'>
        <p className='text-center font-medium text-lg'>No jobs are applied.</p>
      </div>
    </div>
  )
}
