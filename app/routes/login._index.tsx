import { ActionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { authenticator } from '~/auth.server'

export default function Page() {
  return (
    <Form
      method='post'
      className='flex flex-col justify-center items-center space-y-8'
    >
      <div>
        <h1 className='font-bold text-3xl text-center'>Preebee Admin</h1>
        <p className='text-center'>Login</p>
      </div>
      <input
        placeholder='Key...'
        type='text'
        className='input input-bordered'
        name='key'
      />
      <button className='btn btn-primary'>Submit</button>
    </Form>
  )
}

export async function action({ request }: ActionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  })
}
