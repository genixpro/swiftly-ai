import React from 'react';
import { formatDate } from '../../utils/dates';

/** Compatibility-shaped date display while callers move to the shared formatter. */
export default function MomentDisplay({ children, date, value, format, ...props }) {
  const source = date ?? value ?? children;
  const rendered = formatDate(source, format || 'LL');
  return <time {...props}>{rendered}</time>;
}
