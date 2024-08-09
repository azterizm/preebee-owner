import { hash } from '~/utils/bcrypt.server'
import { ActionArgs, json, redirect } from '@remix-run/node'
import { updateRiderPasswordById } from '~/models/rider.server'

export async function loader() {
  return redirect('/')
}
export async function action({ request }: ActionArgs) {
  const form = await request.formData()
  const id = form.get('id')
  const password = form.get('password')
  if (typeof id !== 'string' || typeof password !== 'string') {
    return json({ error: 'Invalid body.' })
  }
  const newHash = await hash(password, 10)
  await updateRiderPasswordById(id, newHash)
  return json({ error: null })
}
