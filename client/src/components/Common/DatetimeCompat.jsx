import React from 'react';

// React 18-safe replacement for the retired react-datetime widget.
export default function DatetimeCompat({ value, onChange, inputProps = {} }) {
  let rendered = '';
  if (value && typeof value.format === 'function') rendered = value.format('YYYY-MM-DD');
  else if (value instanceof Date && !Number.isNaN(value.getTime())) rendered = value.toISOString().slice(0, 10);
  else if (typeof value === 'string') rendered = value.slice(0, 10);

  const handleChange = event => {
    const nextValue = event.target.value;
    onChange?.(nextValue ? { toDate: () => new Date(`${nextValue}T00:00:00.000Z`) } : '');
  };

  return <input type="date" value={rendered} onChange={handleChange} {...inputProps} />;
}
