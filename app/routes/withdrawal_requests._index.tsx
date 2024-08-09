import { ActionArgs, json, LoaderArgs } from '@remix-run/node'
import { useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'
import classNames from 'classnames'
import GoBack from '~/components/GoBack'
import { prisma } from '~/db.server'

export async function loader({ request }: LoaderArgs) {
  const params = new URLSearchParams(request.url.split('?')[1])
  const showAll = params.get('showAll') === 'true'
  const data = await prisma.withdrawRequest.findMany({
    select: {
      reason: true,
      paymentMethod: true,
      status: true,
      id: true,
      seller: {
        select: {
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          address: true,
          jazzCash: true,
          easyPaisa: true,
          bankAccount: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    where: showAll ? undefined : {
      status: {
        notIn: ['Done', 'Failed'],
      },
    },
  })

  return json({ data })
}

export default function Page() {
  const { data } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const [params, setParams] = useSearchParams()

  function handle(
    id: string,
    action: string,
  ) {
    const form = new FormData()
    form.append('id', id)
    form.append('action', action)

    if (action === 'failed') {
      const reason = prompt('Reason for failure')
      if (!reason) return
      form.append('reason', reason)
    }

    if (!confirm('Are you sure?')) return

    fetcher.submit(form, { method: 'post' })
  }
  return (
    <div>
      <div className='relative'>
        <h1 className='text-center text-3xl font-bold'>Withdrawal Requests</h1>
        <GoBack />
      </div>
      <div className='form-control w-max ml-auto my-4'>
        <label className='label cursor-pointer'>
          <span className='label-text'>Show All</span>
          <input
            type='checkbox'
            className='checkbox ml-2'
            onChange={(e) =>
              setParams(
                new URLSearchParams({
                  showAll: e.target.checked.toString(),
                }),
              )}
            checked={params.get('showAll') === 'true'}
          />
        </label>
      </div>
      <div className='my-8 overflow-x-auto'>
        <table className='table'>
          <thead>
            <tr>
              <th>Status</th>
              <th>Payment Mthod</th>
              <th>Reason</th>
              <th>Seller</th>
              <th>Payment Information</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td>{r.status}</td>
                <td>{r.paymentMethod}</td>
                <td>{r.reason}</td>
                <td>
                  {renderObject(r.seller)}
                </td>
                <td>
                  {r.paymentMethod === 'BankAccount'
                    ? renderObject(r.seller.bankAccount)
                    : r.paymentMethod === 'JazzCash'
                    ? renderObject(r.seller.jazzCash)
                    : renderObject(r.seller.easyPaisa)}
                </td>
                <td
                  className={classNames(
                    'space-x-4 flex items-center',
                    r.status === 'Done' || r.status === 'Failed'
                      ? 'opacity-0'
                      : '',
                  )}
                >
                  <button
                    onClick={() => handle(r.id, 'done')}
                    className='btn btn-sm btn-success'
                    disabled={fetcher.state !== 'idle'}
                  >
                    Done
                  </button>
                  <button
                    disabled={fetcher.state !== 'idle'}
                    onClick={() => handle(r.id, 'failed')}
                    className='btn btn-sm btn-error'
                  >
                    Failed
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export async function action({ request }: ActionArgs) {
  const form = await request.formData()
  const id = form.get('id')?.toString()
  const action = form.get('action')?.toString()
  const reason = form.get('reason')?.toString()
  await prisma.withdrawRequest.update({
    where: { id },
    data: {
      status: action === 'done' ? 'Done' : 'Failed',
      reason,
    },
  })
  return 'ok'
}

function renderObject(obj: any) {
  return Object.entries(obj).map(([key, val], i) =>
    typeof val !== 'string' || key === 'id' || key.endsWith('Id')
      ? null
      : (
        <div className='' key={i}>
          <span className='font-bold'>{key}{' '}</span>
          <span>
            {key.endsWith('At') ? new Date(val).toLocaleDateString() : val}
          </span>
        </div>
      )
  )
}
