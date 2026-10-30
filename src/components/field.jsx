import { useId } from 'react';

export function Field({ label, hint, value, onChange, required, type = 'text', multiline, autoComplete = "off" }) {
  const id = useId();
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <p>
      <label htmlFor={id}>
        {label} {required && <span className="required-mark">*</span>}
        {hint && <small>{hint}</small>}
      </label>
      <Tag
        id={id}
        type={multiline ? undefined : type}
        value={value ?? ''}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </p>
  );
}