export function TechnologyOrbit() {
  return (
    <div
      className="technology-orbit"
      role="img"
      aria-label="Tecnologias do projeto: React, TypeScript, Vite, Three.js, Java, Spring Boot e MySQL"
    >
      <span className="technology-orbit-badge technology-react" title="React" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.35">
            <ellipse cx="12" cy="12" rx="10" ry="3.8" />
            <ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(120 12 12)" />
          </g>
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span className="technology-orbit-badge technology-typescript" title="TypeScript" aria-hidden="true">
        <span className="technology-mark-text">TS</span>
      </span>
      <span className="technology-orbit-badge technology-vite" title="Vite" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M2.4 4.2 12 21.5 21.6 4.2 12 6.1 2.4 4.2Zm10.5 1.6 3.4-.7-5 8.1 1.6-5.5-3.2.4 3.2-5.2v2.9Z" />
        </svg>
      </span>
      <span className="technology-orbit-badge technology-three" title="Three.js" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="m12 2.5 9 5.1v8.8l-9 5.1-9-5.1V7.6l9-5.1Z M3 7.6l9 5.1 9-5.1 M12 12.7v8.8 M7.4 5.1l9 5.1v5.2" />
        </svg>
      </span>
      <span className="technology-orbit-badge technology-java" title="Java" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M9 16.5c-2.8.4-4.5 1.1-4.5 2 0 1.2 3.4 2.2 7.5 2.2s7.5-1 7.5-2.2c0-.9-1.7-1.6-4.5-2M8 14.7c-1.7.3-2.7.8-2.7 1.4 0 1 3 1.8 6.7 1.8s6.7-.8 6.7-1.8c0-.6-1-1.1-2.7-1.4M10 12.4c-1.4-1.4 2.8-2.1 2.8-3.8 0-.7-.4-1.3-1.1-1.9M14 12.8c2.2-1.8 3.1-2.6 2.2-4.1M8.4 13.8c-1.2.1-2 .5-2 .9 0 .7 2.5 1.2 5.6 1.2s5.6-.5 5.6-1.2c0-.4-.8-.8-2-1" />
          <path d="M10.2 4.8c.8-.8 1.2-1.4.2-2.3M14.4 5.6c1-1 .9-1.7 0-2.5" />
        </svg>
      </span>
      <span className="technology-orbit-badge technology-spring" title="Spring Boot" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M20.5 3.5C11 3.6 5.3 5.7 5.3 12c0 3.4 2.1 5.3 5.1 5.3 6.2 0 8.7-7 10.1-13.8ZM3.5 21c2.7-5.3 7-8.8 13.5-11.3" />
          <path d="M10.3 9.8c2.3.1 4.1.8 5.5 2.1" />
        </svg>
      </span>
      <span className="technology-orbit-badge technology-mysql" title="MySQL" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M4 6.2c0 1.5 3.6 2.7 8 2.7s8-1.2 8-2.7-3.6-2.7-8-2.7-8 1.2-8 2.7ZM4 6.2v11.6c0 1.5 3.6 2.7 8 2.7s8-1.2 8-2.7V6.2M4 12c0 1.5 3.6 2.7 8 2.7s8-1.2 8-2.7" />
        </svg>
      </span>
    </div>
  )
}
