// src/providers/MenuLink.tsx
import Link, { LinkProps } from 'next/link';
import React, { AnchorHTMLAttributes, forwardRef, RefObject } from 'react';
import useTextHoverAnimation from '@/components/animations/TextHoverAnimation';

type MenuLinkProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    onClick?: () => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    staticText?: string;
  };

const MenuLink = forwardRef<HTMLAnchorElement, MenuLinkProps>(
  (
    {
      href,
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      staticText,
      ...rest
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLAnchorElement>(null);

    // Merge the internal ref (for hover) with the external ref (for GSAP menu)
    const setRefs = React.useCallback(
      (node: HTMLAnchorElement | null) => {
        (internalRef as React.MutableRefObject<HTMLAnchorElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLAnchorElement | null>).current = node;
        }
      },
      [ref]
    );

    useTextHoverAnimation(internalRef as RefObject<HTMLAnchorElement>);

    const text = children?.toString() || '';
    const displayStatic = staticText !== undefined ? staticText : text;

    return (
      <Link
        href={href}
        ref={setRefs}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...rest}
      >
        <span className="text-link-wrapper relative block overflow-hidden">
          <span className="static-text line" style={{ display: 'inline-block' }}>
            {displayStatic}
          </span>

          <span
            className="animated-text line"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'inline-block',
              transform: 'translateY(100%)',
            }}
          >
            {text}
          </span>
        </span>
      </Link>
    );
  }
);

MenuLink.displayName = 'MenuLink';

export default MenuLink;