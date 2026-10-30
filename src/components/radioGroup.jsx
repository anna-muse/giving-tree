import { useId } from 'react';

export function RadioGroup({ label, hint, name, options, value, onChange, required }) {
  const labelId = useId();
  return (
    <>
      <p className="group-label" id={labelId}>
        {label} {required && <span className="required-mark">*</span>}
        {hint && <small>{hint}</small>}
      </p>
      <div role="radiogroup" aria-labelledby={labelId}>
        {options.map((option) => (
          <label className="radio-option" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              required={required}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </>
  );
}