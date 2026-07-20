import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: `https://${string}`;
}

export function ExternalLink({ children, className = "", ...props }: ExternalLinkProps) {
  return (
    <a className={`external-link ${className}`} rel="noreferrer" {...props}>
      {children}
      <span aria-hidden="true" className="external-mark">↗</span>
      <span className="sr-only"> (opens an external site)</span>
    </a>
  );
}
