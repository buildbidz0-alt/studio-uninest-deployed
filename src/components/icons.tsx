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
    <path d="M12.67 19a1 1 0 0 0-1.34 0l-5.03 5.03-1.3-1.3 5.03-5.03a1 1 0 0 0 0-1.34l-5.03-5.03 1.3-1.3 5.03 5.03a1 1 0 0 0 1.34 0l5.03-5.03 1.3 1.3-5.03 5.03a1 1 0 0 0 0 1.34l5.03 5.03-1.3 1.3z" />
    <path d="M12 19l-5.03 5.03" />
    <path d="M12.67 19l5.03 5.03" />
    <path d="M12 7V1" />
    <path d="M10 3h4" />
  </svg>
);
