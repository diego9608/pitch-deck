import React from 'react';

export interface HubLink {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

interface HubGridProps {
  links: HubLink[];
}

export function HubGrid({ links }: HubGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="glass-card hover:border-[var(--color-accent)] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] min-h-[120px]"
        >
          {link.icon && (
            <div className="text-4xl mb-3" aria-hidden="true">
              {link.icon}
            </div>
          )}
          <h3 className="text-xl font-bold text-[var(--color-fg)] mb-2">
            {link.title}
          </h3>
          <p className="text-[var(--color-fg)] opacity-75 text-sm">
            {link.description}
          </p>
        </a>
      ))}
    </div>
  );
}
