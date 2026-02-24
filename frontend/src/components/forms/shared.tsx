interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  required = false,
  className = '',
}: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
    />
  );
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function Textarea({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className = '',
  rows = 3,
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      rows={rows}
    />
  );
}

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  id?: string;
  label?: string;
  min?: string;
  max?: string;
}

export function DateInput({
  value,
  onChange,
  disabled = false,
  inputClassName = '',
  labelClassName = '',
  id = 'date',
  label,
  min,
  max,
}: DateInputProps) {
  return (
    <>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <input
        id={id}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={inputClassName}
        min={min}
        max={max}
      />
    </>
  );
}
