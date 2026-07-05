interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
      />
    </div>
  )
}
