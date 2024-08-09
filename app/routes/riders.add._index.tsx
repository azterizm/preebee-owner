import { useForm } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import { ArrowRight, Spinner } from '@phosphor-icons/react'
import { ActionArgs, json, redirect } from '@remix-run/node'
import {
  Form,
  useActionData,
  useNavigation,
  V2_MetaFunction,
} from '@remix-run/react'
import _ from 'lodash'
import { useState } from 'react'
import slugify from 'slugify'
import { twMerge } from 'tailwind-merge'
import uniqid from 'uniqid'
import { z } from 'zod'
import GoBack from '~/components/GoBack'
import { createRider } from '~/models/rider.server'
import { hash } from '~/utils/bcrypt.server'

export default function AddRider() {
  const navigation = useNavigation()
  const lastSubmission = useActionData<typeof action>()
  const [phoneInput, setPhone] = useState('')
  const [form, { email, address, name, phone, password }] = useForm({
    lastSubmission,
  })
  const isLoading = navigation.state !== 'idle'
  return (
    <Form className='mb-16' method='post' {...form.props}>
      <div className='relative'>
        <h1 className='text-center text-3xl font-bold'>Add new rider</h1>
        <GoBack />
      </div>
      <div className='mt-16 max-w-lg mx-auto block space-y-4'>
        {[['Abdullah Memon', name], [
          'Qasimabad, Hyderabad, Sindh',
          address,
        ]].map((
          [placeholder, formEntity]: any,
          i,
        ) => (
          <div key={i} className='form-control w-full'>
            <label className='label' htmlFor={formEntity.name}>
              <span className='label-text'>
                {_.capitalize(formEntity.name)}
              </span>
            </label>
            <input
              type='text'
              placeholder={placeholder}
              className={twMerge(
                'input input-bordered w-full',
                formEntity.error ? 'input-error' : '',
              )}
              name={formEntity.name}
              required
            />
            {formEntity.error && (
              <label className='label'>
                <span className='text-error label-text-alt'>
                  {formEntity.error}
                </span>
              </label>
            )}
          </div>
        ))}

        <div className='form-control w-full'>
          <label className='label' htmlFor='email'>
            <span className='label-text'>Email</span>
          </label>
          <input
            type='email'
            name={email.name}
            id='email'
            required
            className={twMerge(
              'input input-bordered w-full',
              email.error ? 'input-error' : '',
            )}
            placeholder='abdullahmemon@gmail.com'
          />
          {email.error && (
            <label className='label'>
              <span className='text-error label-text-alt'>{email.error}</span>
            </label>
          )}
        </div>

        <div className='form-control w-full'>
          <label className='label' htmlFor='phone'>
            <span className='label-text'>Phone Number</span>
          </label>
          <div className='join'>
            <span className='py-3 px-4 rounded-r-none bg-tint'>+92</span>
            <input
              type='number'
              name={phone.name}
              id='phone'
              required
              value={phoneInput}
              onChange={(e) => setPhone(e.target.value.slice(0, 10))}
              className={twMerge(
                'input input-bordered w-full rounded-l-none',
                phone.error ? 'input-error' : '',
              )}
              placeholder='3000000000'
            />
          </div>
          {phone.error && (
            <label className='label'>
              <span className='text-error label-text-alt'>{phone.error}</span>
            </label>
          )}
        </div>

        <div className='form-control w-full'>
          <label className='label' htmlFor='password'>
            <span className='label-text'>Password</span>
          </label>

          <input
            type='password'
            className={twMerge(
              'input input-bordered w-full',
              password.error ? 'input-error' : '',
            )}
            name={password.name}
            required
          />
          {password.error && (
            <label className='label'>
              <span className='text-error label-text-alt'>
                {password.error}
              </span>
            </label>
          )}
        </div>

        <div className='flex items-center justify-end !mt-14'>
          <button className='btn btn-primary' disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'} {isLoading
              ? <Spinner width={24} height={24} className='animate-spin' />
              : <ArrowRight />}
          </button>
        </div>
      </div>
    </Form>
  )
}

export async function action({ request }: ActionArgs) {
  const form = await request.formData()
  const submission = parse(form, { schema })
  if (!submission.value || submission.intent !== 'submit') {
    return json(submission)
  }
  const username = slugify(submission.value.name, { trim: true, lower: true }) +
    '@' + uniqid().slice(-5)
  const password = await hash(submission.value.password, 10)
  await createRider({
    ..._.omit(submission.value, ['password']),
    username,
    passwordHash: password,
  })
  return redirect('/riders')
}

export const meta: V2_MetaFunction = () => [{ title: 'Add rider' }]

const schema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  email: z.string().email({ message: 'Must be email.' }),
  phone: z.string().length(10, {
    message: 'Number must have atleast 10 characters.',
  }).startsWith('3', { message: 'Number must start with 3 character.' }),
  password: z.string().min(8),
})
