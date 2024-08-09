import { LoaderArgs, json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import GoBack from '~/components/GoBack'
import { prisma } from '~/db.server'

export async function loader() {
  const verifications = await prisma.seller.findMany({
    where: {
      status: 'Verify',
      nationalIdentityCard: {
        isNot: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  })
  return json({ verifications })
}
export default function Verifications() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <div className='relative'>
        <h1 className='text-center text-3xl font-bold'>Verifications</h1>
        <GoBack />
      </div>
      <div className='overflow-x-auto mt-8'>
        <table className='table'>
          <thead>
            <tr>
              <th className='text-left'>Name</th>
              <th className='text-left'>Email</th>
              <th className='text-left'>Phone</th>
              <th className='text-left'>National Identity Card</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.verifications.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>
                  <img
                    className='w-56'
                    src={`/api/verification/nic/front/image/${r.id}`}
                  />
                  <img
                    className='w-56'
                    src={`/api/verification/nic/back/image/${r.id}`}
                  />
                </td>
                <td>
                  <Form method='post' className='flex items-center gap-4'>
                    <button
                      name='action'
                      value='approve'
                      className='btn-sm btn btn-success'
                    >
                      Approve
                    </button>
                    <button
                      name='action'
                      value='decline'
                      className='btn-sm btn btn-error'
                    >
                      Decline
                    </button>
                    <input type='hidden' name='id' value={r.id} />
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export async function action({ request }: LoaderArgs) {
  const body = new URLSearchParams(await request.text())
  const id = body.get('id')
  const action = body.get('action')
  if (!id || !action) {
    return new Response(null, { status: 400 })
  }
  await prisma.seller.update({
    where: { id },
    data: {
      status: action === 'approve' ? 'Active' : 'Onboard',
    },
  })
  return new Response(null, {
    status: 303,
    headers: { Location: '/verifications' },
  })
}
