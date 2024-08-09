
import { MagnifyingGlass } from '@phosphor-icons/react'
import { ActionArgs, json } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import GoBack from '~/components/GoBack'
import { prisma } from '~/db.server'
import { useDebounce } from '~/hooks/ui'

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const search = formData.get('search')?.toString()
  const data = await prisma.seller.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      status:true
    },
    where: !search ? undefined : {
      name: {
        contains: search,
      },
    },
  })
  return json(data)
}

export default function Page() {
  const [search, setSearch] = useState('')
  const searchDebounced = useDebounce(search, 500)
  const fetcher = useFetcher()
  useEffect(() => {
    const formData = new FormData()
    formData.append('search', searchDebounced)
    fetcher.submit(formData, { method: 'post' })
  }, [searchDebounced])
  return (
    <div>
      <div className='relative'>
        <h1 className='text-center text-3xl font-bold'>Sellers</h1>
        <GoBack />
      </div>

      <div className='my-8'>
        <div className='flex items-center justify-end'>
          <MagnifyingGlass />
          <input
            placeholder='Search...'
            type='text'
            className='input input-bordered ml-2'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className='flex items-center justify-center gap-6 flex-wrap my-4'>
          {fetcher.state !== 'idle'
            ? 'Loading...'
            : fetcher.data?.map((r: any) => (
              <Link to={r.id} key={r.id} className='card bg-base-200 shadow-xl'>
                <div className='card-body'>
                  <div className='card-title'>{r.name}</div>
                  <div className='card-subtitle text-gray-500'>{r.email}</div>
                  {r.blocked
                    ? <div className='badge badge-error mt-2'>Blocked</div>
                    : null}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
