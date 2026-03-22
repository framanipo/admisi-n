import React from 'react';

export const UniqLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chakana Outline */}
      <path 
        d="M40 5 L80 5 L80 40 L115 40 L115 80 L80 80 L80 115 L40 115 L40 80 L5 80 L5 40 L40 40 Z" 
        fill="white" 
        stroke="#0891b2" /* cyan-600 */
        strokeWidth="3"
        strokeLinejoin="miter"
      />
      
      {/* Inner Light Blue Circle */}
      <circle cx="60" cy="60" r="38" fill="#cffafe" /* cyan-100 */ />
      
      {/* Yellow Sun */}
      <circle cx="60" cy="38" r="10" fill="#eab308" /* yellow-500 */ />
      
      {/* Tube / U-Shape */}
      <path 
        d="M60 48 L60 80 A 8 8 0 0 1 44 80 L44 55 A 8 8 0 0 0 28 55 L28 75" 
        stroke="#0891b2" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M66 48 L66 80 A 14 14 0 0 1 38 80 L38 55 A 14 14 0 0 0 10 55 L10 75" 
        stroke="#0891b2" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Green Leaf */}
      <path 
        d="M55 85 Q 75 80 90 90 Q 70 100 55 85 Z" 
        fill="#65a30d" /* lime-600 */
      />
      <path 
        d="M55 85 Q 75 80 90 90" 
        stroke="#fefce8" 
        strokeWidth="1" 
        fill="none" 
      />
    </svg>
  );
};
