import { ArrowLeft } from '@phosphor-icons/react'
import { useNavigate } from '@remix-run/react'

export default function GoBack() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      type='button'
      className='btn btn-primary absolute top-0 left-0 h-full'
    >
      <ArrowLeft />
      Go back
    </button>
  )
}
