
import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary-start))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-end))', stopOpacity: 1 }} />
      </linearGradient>
       <linearGradient id="logo-gradient-fill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary-start))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-end))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path 
      d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V13.1429C20 12 19.1429 11 18 11H13C10.2386 11 8 8.76142 8 6V4C8 2.89543 7.10457 2 6 2Z" 
      fill="url(#logo-gradient-fill)" 
    />
  </svg>
);
