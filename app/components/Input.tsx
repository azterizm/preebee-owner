export interface InputProps {
  name: string
  type?: string
  placeholder?: string
  label?: string
  hint?: string
  defaultValue?: string
  required?: boolean
  min?: number | string
  max?: number | string
}

export default function Input(props: InputProps) {
  return (
    <div>
      <label
        htmlFor={props.name}
        className='block text-sm text-primary capitalize'
      >
        {props.label || (props.name)}
      </label>

      <input
        required={props.required}
        type={props.type || 'text'}
        value={props.defaultValue || ''}
        className='mt-2 block w-full placeholder-primary/50 rounded-lg border border-primary bg-white px-5 py-2.5 text-primary focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40'
        placeholder={props.placeholder || ''}
        name={props.name}
        id={props.name}
        min={props.min?.toString() || ''}
        max={props.max?.toString() || ''}
      />

      {props.hint
        ? <p className='mt-3 text-xs text-primary'>{props.hint}</p>
        : null}
    </div>
  )
}
