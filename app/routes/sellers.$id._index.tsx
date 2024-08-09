import { ActionArgs, json, LoaderArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import GoBack from '~/components/GoBack'
import { prisma } from '~/db.server'

export async function loader({ params }: LoaderArgs) {
  const id = params.id
  const data = await prisma.seller.findUnique({
    where: { id: id },
  })
  return json(_.omit(data, ['accessToken', 'refreshToken']))
}
export default function Page() {
  const fetcher = useFetcher()
  const data = useLoaderData<typeof loader>()
  if (!data) {
    return (
      <div>
        <p>No such customer.</p>
      </div>
    )
  }
  return (
    <div>
      <div className='relative'>
        <h1 className='text-center text-3xl font-bold'>Seller</h1>
        <p className='text-center'>{data?.name}</p>
        <GoBack />
      </div>
      <div className='overflow-x-auto my-8'>
        <table className='table'>
          <tbody>
            {Object.entries(data).filter((r) => r[0] !== 'blocked').map((
              [key, value],
            ) => (
              <tr key={key}>
                <td className='font-bold px-4 py-2'>{key}</td>
                <td className='px-4 py-2'>
                  {key === 'earnings'
                    ? Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PKR',
                    }).format(Number(value || '0'))
                    : !value
                    ? 'EMPTY'
                    : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex items-center justify-center gap-6 flex-wrap'>
        <fetcher.Form method='post'>
          <button
            name='action'
            value='block'
            disabled={fetcher.state !== 'idle'}
            className='btn btn-error'
          >
            Block
          </button>
        </fetcher.Form>
      </div>
    </div>
  )
}

export async function action({ request, params }: ActionArgs) {
  const body = await request.formData()
  const action = body.get('action')
  const id = params.id
  if (!id) {
    return json({ message: 'no id' }, { status: 400 })
  }
  if (action === 'block') {
    const data = await prisma.seller.findUnique({
      where: { id: id },
      select: { status: true },
    })
    await prisma.seller.update({
      where: { id: id as string },
      data: {
        status: data?.status === 'Blocked' ? 'Active' : 'Blocked',
      },
    })
  }
  return json({ message: 'done' })
}
