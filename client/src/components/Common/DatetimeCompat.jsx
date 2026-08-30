import React from 'react';

// React 18-safe replacement for the retired react-datetime widget.
export default function DatetimeCompat({ value, onChange, inputProps = {} }) {
  const rendered = value && typeof value.format === 'function' ? value.format('YYYY-MM-DD') : (value || '');
  return <input type="date" value={rendered} onChange={event => onChange?.(event.target.value)} {...inputProps} />;
}
