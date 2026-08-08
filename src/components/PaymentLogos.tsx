interface LogoProps {
  className?: string;
}

export function WaveLogo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 20c2.5-4 5-4 7.5 0s5 4 7.5 0 5-4 7.5 0 5 4 7.5 0"
        stroke="#1DC8FF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="42" y="26" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#1DC8FF">
        Wave
      </text>
    </svg>
  );
}

export function OrangeMoneyLogo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 160 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="20" r="10" fill="#FF6600" />
      <text x="4" y="25" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="white">OM</text>
      <text x="30" y="26" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700" fill="#333333">
        Orange Money
      </text>
    </svg>
  );
}
