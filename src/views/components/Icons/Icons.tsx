import type { ReactNode } from 'react'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Icon>
)

export const GamesIcon = () => (
  <Icon>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="15" cy="15" r="1.2" fill="currentColor" />
  </Icon>
)

export const MatchesIcon = () => (
  <Icon>
    <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
    <path d="M8 6H5a3 3 0 0 0 3 4" />
    <path d="M16 6h3a3 3 0 0 1-3 4" />
    <path d="M12 13v4" />
    <path d="M8 20h8" />
  </Icon>
)

export const SettingsIcon = () => (
  <Icon>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Icon>
)

export const MoonIcon = () => (
  <Icon>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </Icon>
)

export const SunIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
)

export const CloseIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const EyeIcon = () => (
  <Icon>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeOffIcon = () => (
  <Icon>
    <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Icon>
)

export const UsersIcon = () => (
  <Icon>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.7 3.5 2.8 3.5 5.7" />
  </Icon>
)

export const ClockIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const CalendarIcon = () => (
  <Icon>
    <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
)

export const LogoutIcon = () => (
  <Icon>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M9 16l-4-4 4-4M5 12h11" />
  </Icon>
)

export const CameraIcon = () => (
  <Icon>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </Icon>
)

export const UploadIcon = () => (
  <Icon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
)

export const TrashIcon = () => (
  <Icon>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
)

export const TrophyIcon = () => (
  <Icon>
    <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Icon>
)

export const SparklesIcon = () => (
  <Icon>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </Icon>
)

export const CheckIcon = () => (
  <Icon>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
)

export const D20Icon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <polygon points="24,2.5 43.5,13.75 43.5,34.25 24,45.5 4.5,34.25 4.5,13.75" fill="currentColor" />
    <polygon points="24,10.5 37.5,32.5 10.5,32.5" fill="none" stroke="var(--noite)" strokeWidth="2" strokeLinejoin="round" />
    <line x1="24" y1="2.5" x2="24" y2="10.5" stroke="var(--noite)" strokeWidth="2" strokeLinecap="round" />
    <line x1="43.5" y1="13.75" x2="37.5" y2="32.5" stroke="var(--noite)" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.5" y1="13.75" x2="10.5" y2="32.5" stroke="var(--noite)" strokeWidth="2" strokeLinecap="round" />
    <line x1="43.5" y1="13.75" x2="24" y2="10.5" stroke="var(--noite)" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="4.5" y1="13.75" x2="24" y2="10.5" stroke="var(--noite)" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="24" y1="45.5" x2="37.5" y2="32.5" stroke="var(--noite)" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="24" y1="45.5" x2="10.5" y2="32.5" stroke="var(--noite)" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="43.5" y1="34.25" x2="37.5" y2="32.5" stroke="var(--noite)" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="4.5" y1="34.25" x2="10.5" y2="32.5" stroke="var(--noite)" strokeWidth="1.8" strokeLinecap="round" />
    <text
      x="24"
      y="28"
      textAnchor="middle"
      fill="var(--noite)"
      fontFamily="var(--texto)"
      fontWeight="800"
      fontSize="11"
      letterSpacing="-0.5"
    >
      20
    </text>
  </svg>
)
