export function NipNipLogo({ className = 'h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NipNip"
      role="img"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="nn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>

      {/* Deep extrusion */}
      <g transform="translate(16, 16) skewX(-3) skewY(2)">
        <path d="M2,0 L2,135 L36,135 L36,63 L80,135 L114,135 L114,0 L80,0 L80,72 L36,0 Z" fill="#0d0540" stroke="#0d0540" strokeWidth="8" strokeLinejoin="round"/>
        <path d="M130,40 L130,135 L160,135 L160,40 Z" fill="#0d0540" stroke="#0d0540" strokeWidth="8" strokeLinejoin="round"/>
        <circle cx="145" cy="15" r="16" fill="#0d0540" stroke="#0d0540" strokeWidth="8"/>
        <path d="M176,40 L176,175 L206,175 L206,100 L236,100 Q270,100 270,70 Q270,40 236,40 Z M206,65 L206,80 L230,80 Q242,80 242,72.5 Q242,65 230,65 Z" fill="#0d0540" stroke="#0d0540" strokeWidth="8" strokeLinejoin="round"/>
        <path d="M286,40 L286,135 L316,135 L316,75 L346,75 L346,135 L376,135 L376,70 Q376,40 346,40 L286,40 Z" fill="#0d0540" stroke="#0d0540" strokeWidth="8" strokeLinejoin="round"/>
        <path d="M392,40 L392,135 L422,135 L422,40 Z" fill="#0d0540" stroke="#0d0540" strokeWidth="8" strokeLinejoin="round"/>
        <circle cx="407" cy="15" r="16" fill="#0d0540" stroke="#0d0540" strokeWidth="8"/>
        <path d="M438,40 L438,175 L468,175 L468,100 L498,100 Q532,100 532,70 Q532,40 498,40 Z M468,65 L468,80 L492,80 Q504,80 504,72.5 Q504,65 492,65 Z" fill="#0d0540" stroke="#0d0540" strokeWidth="8" strokeLinejoin="round"/>
      </g>

      {/* Mid extrusion */}
      <g transform="translate(10, 10) skewX(-2) skewY(1.3)">
        <path d="M2,0 L2,135 L36,135 L36,63 L80,135 L114,135 L114,0 L80,0 L80,72 L36,0 Z" fill="#2a1070" stroke="#3a1890" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M130,40 L130,135 L160,135 L160,40 Z" fill="#2a1070" stroke="#3a1890" strokeWidth="6" strokeLinejoin="round"/>
        <circle cx="145" cy="15" r="16" fill="#2a1070" stroke="#3a1890" strokeWidth="6"/>
        <path d="M176,40 L176,175 L206,175 L206,100 L236,100 Q270,100 270,70 Q270,40 236,40 Z M206,65 L206,80 L230,80 Q242,80 242,72.5 Q242,65 230,65 Z" fill="#2a1070" stroke="#3a1890" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M286,40 L286,135 L316,135 L316,75 L346,75 L346,135 L376,135 L376,70 Q376,40 346,40 L286,40 Z" fill="#2a1070" stroke="#3a1890" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M392,40 L392,135 L422,135 L422,40 Z" fill="#2a1070" stroke="#3a1890" strokeWidth="6" strokeLinejoin="round"/>
        <circle cx="407" cy="15" r="16" fill="#2a1070" stroke="#3a1890" strokeWidth="6"/>
        <path d="M438,40 L438,175 L468,175 L468,100 L498,100 Q532,100 532,70 Q532,40 498,40 Z M468,65 L468,80 L492,80 Q504,80 504,72.5 Q504,65 492,65 Z" fill="#2a1070" stroke="#3a1890" strokeWidth="6" strokeLinejoin="round"/>
      </g>

      {/* Light extrusion */}
      <g transform="translate(5, 5) skewX(-1) skewY(0.7)">
        <path d="M2,0 L2,135 L36,135 L36,63 L80,135 L114,135 L114,0 L80,0 L80,72 L36,0 Z" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M130,40 L130,135 L160,135 L160,40 Z" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4" strokeLinejoin="round"/>
        <circle cx="145" cy="15" r="16" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4"/>
        <path d="M176,40 L176,175 L206,175 L206,100 L236,100 Q270,100 270,70 Q270,40 236,40 Z M206,65 L206,80 L230,80 Q242,80 242,72.5 Q242,65 230,65 Z" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M286,40 L286,135 L316,135 L316,75 L346,75 L346,135 L376,135 L376,70 Q376,40 346,40 L286,40 Z" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M392,40 L392,135 L422,135 L422,40 Z" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4" strokeLinejoin="round"/>
        <circle cx="407" cy="15" r="16" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4"/>
        <path d="M438,40 L438,175 L468,175 L468,100 L498,100 Q532,100 532,70 Q532,40 498,40 Z M468,65 L468,80 L492,80 Q504,80 504,72.5 Q504,65 492,65 Z" fill="#6b3ab8" stroke="#7b44cc" strokeWidth="4" strokeLinejoin="round"/>
      </g>

      {/* Front face — gradient fill */}
      <g transform="skewX(-0.5) skewY(0.3)">
        <path d="M2,0 L2,135 L36,135 L36,63 L80,135 L114,135 L114,0 L80,0 L80,72 L36,0 Z" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M130,40 L130,135 L160,135 L160,40 Z" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3" strokeLinejoin="round"/>
        <circle cx="145" cy="15" r="16" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3"/>
        <path d="M176,40 L176,175 L206,175 L206,100 L236,100 Q270,100 270,70 Q270,40 236,40 Z M206,65 L206,80 L230,80 Q242,80 242,72.5 Q242,65 230,65 Z" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3" strokeLinejoin="round" fillRule="evenodd"/>
        <path d="M286,40 L286,135 L316,135 L316,75 L346,75 L346,135 L376,135 L376,70 Q376,40 346,40 L286,40 Z" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M392,40 L392,135 L422,135 L422,40 Z" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3" strokeLinejoin="round"/>
        <circle cx="407" cy="15" r="16" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3"/>
        <path d="M438,40 L438,175 L468,175 L468,100 L498,100 Q532,100 532,70 Q532,40 498,40 Z M468,65 L468,80 L492,80 Q504,80 504,72.5 Q504,65 492,65 Z" fill="url(#nn-grad)" stroke="#A684FF" strokeWidth="3" strokeLinejoin="round" fillRule="evenodd"/>
      </g>
    </svg>
  )
}
