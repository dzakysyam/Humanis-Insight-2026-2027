import type { ModuleKey } from '@humanis/backend';

/**
 * Ilustrasi editorial ringkas untuk setiap portal website sekolah di halaman SSO.
 * Menggunakan palet token design.md (navy, orange, blue, green, lavender, cream).
 */
export function SsoModuleArtwork({ moduleKey }: { moduleKey: Exclude<ModuleKey, 'HUMANIS'> }) {
  switch (moduleKey) {
    case 'TATA_USAHA':
      return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
          <rect x="12" y="18" width="72" height="58" rx="10" fill="#E5DFD4" fillOpacity="0.45" />
          <rect x="20" y="24" width="44" height="12" rx="3" fill="#B5D0EA" />
          <path d="M48 30 22 44h52L48 30Z" fill="#123568" />
          <rect x="26" y="44" width="44" height="26" fill="#FFFDF8" stroke="#123568" strokeWidth="2.5" />
          <path d="M34 44v26M44 44v26M54 44v26M64 44v26" stroke="#123568" strokeWidth="2.5" />
          <rect x="22" y="70" width="52" height="6" rx="2" fill="#123568" />
          <circle cx="67" cy="59" r="11" fill="#E88A2E" stroke="#FFFDF8" strokeWidth="2.5" />
          <path d="M67 53v12M63 56.5h6.5a2.5 2.5 0 0 1 0 5H63" stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'ERAPORT':
      return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
          <rect x="18" y="14" width="52" height="68" rx="8" fill="#FFFDF8" stroke="#123568" strokeWidth="2.5" />
          <rect x="26" y="24" width="24" height="5" rx="2.5" fill="#123568" />
          <rect x="26" y="34" width="36" height="4" rx="2" fill="#B5D0EA" />
          <rect x="26" y="43" width="32" height="4" rx="2" fill="#B5D0EA" />
          <rect x="26" y="52" width="26" height="4" rx="2" fill="#D3C7E8" />
          <rect x="26" y="61" width="20" height="4" rx="2" fill="#B3CA8A" />
          <circle cx="66" cy="60" r="12" fill="#E88A2E" stroke="#FFFDF8" strokeWidth="2.5" />
          <path d="M61 70 58 82l8-4 8 4-3-12" fill="#123568" />
          <path d="m62 60 3 3 6-6" stroke="#FFFDF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'RIASEC':
      return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
          <circle cx="48" cy="48" r="32" fill="#B5D0EA" fillOpacity="0.4" stroke="#123568" strokeWidth="2.5" />
          <circle cx="48" cy="48" r="22" fill="#FFFDF8" stroke="#123568" strokeWidth="1.8" strokeDasharray="4 3" />
          <path d="M48 16 55 41 80 48 55 55 48 80 41 55 16 48 41 41 48 16Z" fill="#123568" />
          <path d="M48 24 52 44 72 48 52 52 48 72 44 52 24 48 44 44 48 24Z" fill="#E88A2E" />
          <circle cx="48" cy="48" r="5" fill="#FFFDF8" stroke="#123568" strokeWidth="2" />
        </svg>
      );

    case 'EPOINT':
      return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
          <rect x="14" y="22" width="68" height="54" rx="10" fill="#B3CA8A" fillOpacity="0.35" />
          <path
            d="M48 16 72 25v20c0 16-10 27-24 34-14-7-24-18-24-34V25l24-9Z"
            fill="#123568"
            stroke="#FFFDF8"
            strokeWidth="2.5"
          />
          <path d="M48 27v34M35 37h26" stroke="#F5DF79" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M35 37 30 49h10l-5-12ZM61 37l-5 12h10l-5-12Z" fill="#E88A2E" />
          <rect x="40" y="61" width="16" height="4" rx="2" fill="#FFFDF8" />
        </svg>
      );

    case 'ALUMNI':
      return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
          <rect x="16" y="56" width="12" height="22" rx="3" fill="#B5D0EA" />
          <rect x="34" y="48" width="12" height="30" rx="3" fill="#D3C7E8" />
          <rect x="52" y="40" width="12" height="38" rx="3" fill="#B3CA8A" />
          <rect x="70" y="32" width="12" height="46" rx="3" fill="#123568" />
          <path d="M18 52 38 40 54 44 76 22" stroke="#E88A2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M68 22h8v8" stroke="#E88A2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M46 16 24 25l22 9 22-9-22-9Z" fill="#123568" />
          <path d="M34 30v8c4 3 20 3 24 0v-8" fill="#123568" stroke="#FFFDF8" strokeWidth="1.5" />
        </svg>
      );

    case 'PRESTA':
      return (
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-full w-full">
          <rect x="16" y="20" width="64" height="58" rx="10" fill="#FFFDF8" stroke="#123568" strokeWidth="2.5" />
          <rect x="28" y="48" width="10" height="20" rx="2" fill="#B5D0EA" />
          <rect x="44" y="38" width="10" height="30" rx="2" fill="#123568" />
          <rect x="60" y="30" width="10" height="38" rx="2" fill="#B3CA8A" />
          <circle cx="32" cy="32" r="12" fill="#F5DF79" stroke="#123568" strokeWidth="2.5" />
          <path d="M32 26v6l4 2.5" stroke="#123568" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
