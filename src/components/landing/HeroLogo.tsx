export default function HeroLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#0071E3" />
      <path
        d="M10 12C10 10.8954 10.8954 10 12 10H14C15.1046 10 16 10.8954 16 12V14C16 15.1046 15.1046 16 14 16H12C10.8954 16 10 15.1046 10 14V12Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M18 10C18 10.8954 18.8954 10 20 10H22C23.1046 10 24 10.8954 24 12V14C24 15.1046 23.1046 16 22 16H20C18.8954 16 18 15.1046 18 14V10Z"
        fill="white"
        fillOpacity="0.6"
      />
      <path
        d="M10 18C10 16.8954 10.8954 16 12 16H14C15.1046 16 16 16.8954 16 18V20C16 21.1046 15.1046 22 14 22H12C10.8954 22 10 21.1046 10 20V18Z"
        fill="white"
        fillOpacity="0.6"
      />
      <path
        d="M18 18C18 16.8954 18.8954 16 20 16H22C23.1046 16 24 16.8954 24 18V20C24 21.1046 23.1046 22 22 22H20C18.8954 22 18 21.1046 18 20V18Z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}
