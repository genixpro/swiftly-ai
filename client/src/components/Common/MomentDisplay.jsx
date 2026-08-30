import React from 'react';
import moment from 'moment';

/** Minimal, React-18-safe replacement for the retired react-moment wrapper. */
export default function MomentDisplay({ children, date, value, format, ...props }) {
  const source = date ?? value ?? children;
  const rendered = source == null || source === '' ? '' : moment(source).format(format || 'LL');
  return <time {...props}>{rendered}</time>;
}
