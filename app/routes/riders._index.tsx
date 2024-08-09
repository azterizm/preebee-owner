import { useHookstate } from '@hookstate/core'
import { ArrowLeft, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { ActionArgs, json } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { deleteRiderById, getAllRiders } from '~/models/rider.server'

export async function loader() {
  const riders = await getAllRiders()
  return json({ riders })
}

export default function Riders() {
  const actionData = useActionData<typeof action>()
  const data = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const search = useHookstate('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const changePassword = useHookstate({
    riderId: null as string | null,
    newPassword: '',
    loading: false,
    error: '',
  })
  async function onChangePassword() {
    const { newPassword, riderId } = changePassword
    if (newPassword.value.length < 8 || !riderId.value) return
    const form = new FormData()
    form.append('id', riderId.value)
    form.append('password', newPassword.value)
    changePassword.loading.set(true)
    const response = await fetch('/riders/change_password', {
      method: 'POST',
      body: form,
    })
      .then(
        (r) => r.json(),
      )
    changePassword.loading.set(false)
    if (response.error) changePassword.error.set(response.error)
    else {
      dialogRef.current?.close()
      changePassword.set({
        riderId: null as string | null,
        newPassword: '',
        loading: false,
        error: '',
      })
    }
  }
  useEffect(() => {
    if (actionData?.error) alert(actionData.error)
  }, [actionData])
  return (
    <div>
      <div className='flex items-center justify-between'>
        <Link
          to='..'
          className='btn btn-primary'
        >
          <ArrowLeft /> Go back
        </Link>
        <h1 className='text-3xl font-bold'>Riders</h1>
        <Link
          to='add'
          className='btn btn-primary'
        >
          Add new rider <Plus />
        </Link>
      </div>
      <div className='mt-16'>
        {!data.riders.length
          ? (
            <p className='text-center'>
              There are no riders available right now.
            </p>
          )
          : (
            <div>
              <div className='flex items-center space-x-2 justify-end mb-4'>
                <MagnifyingGlass />
                <input
                  value={search.value}
                  onChange={(e) => search.set(e.target.value)}
                  type='text'
                  className='input input-bordered w-full max-w-xs'
                  placeholder='Search'
                />
              </div>

              <div className='overflow-x-auto'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.riders.filter((r) =>
                      search.value ? r.name.includes(search.value) : true
                    ).map((r) => (
                      <tr key={r.id}>
                        <td>{r.name}</td>
                        <td>{r.username}</td>
                        <td>{r.email}</td>
                        <td>0{r.phone}</td>
                        <td>
                          <div className='flex items-center space-x-3'>
                            <Link
                              to={`jobs/${r.id}`}
                              className='btn btn-primary'
                            >
                              Jobs
                            </Link>
                            <button
                              onClick={() => (
                                changePassword.set({
                                  riderId: r.id,
                                  newPassword: '',
                                  loading: false,
                                  error: '',
                                }), dialogRef.current?.showModal()
                              )}
                              className='btn btn-info'
                            >
                              Change Password
                            </button>
                            <Form method='post'>
                              <button
                                name='delete'
                                value={r.id}
                                className='btn btn-error'
                                disabled={navigation.state !== 'idle'}
                              >
                                Delete
                              </button>
                            </Form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      <dialog ref={dialogRef} id='password_dialog' className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>Change Password</h3>

          <div className='form-control w-full max-w-xs mt-2'>
            <label className='label'>
              <span className='label-text'>New password</span>
            </label>
            <input
              type='password'
              className={twMerge(
                'input input input-bordered',
                changePassword.error?.value ? 'input-error' : '',
              )}
              placeholder='Type here...'
              name='password'
              minLength={8}
              required
              value={changePassword.newPassword.value}
              onChange={(e) => changePassword.newPassword.set(e.target.value)}
            />

            {changePassword.error?.value && (
              <label className='label'>
                <span className='text-error label-text-alt'>
                  {changePassword.error?.value}
                </span>
              </label>
            )}
          </div>
          <div className='modal-action'>
            <button
              disabled={changePassword.loading.value}
              type='button'
              className='btn btn-primary'
              onClick={onChangePassword}
            >
              {changePassword.loading.value ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type='button'
              onClick={() => dialogRef.current?.close()}
              className='btn'
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export async function action({ request }: ActionArgs) {
  const form = await request.formData()
  const toDeleteRider = form.get('delete')
  if (typeof toDeleteRider === 'string') await deleteRiderById(toDeleteRider)
  return json({ error: null })
}
