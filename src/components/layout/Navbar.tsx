'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/IconWrapper';

/**
 * Main navigation bar component with enhanced accessibility and responsive design.
 * Features comprehensive mobile navigation and WCAG 2.1 AA compliant design.
 */
export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Determines if a navigation item is currently active with enhanced path matching
   * @param path - The path to check against the current route
   * @returns Boolean indicating if the path is active
   */
  const isActive = useMemo(() => (path: string) => {
    // Handle exact matches and sub-paths with improved accuracy
    return pathname === path ||
           (path !== '/' && pathname.startsWith(`${path}/`));
  }, [pathname]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Enhanced navigation item component with improved accessibility
  const NavItem = ({ item, isMobile = false }: { item: typeof NAV_ITEMS[number]; isMobile?: boolean }) => {
    const active = isActive(item.href);
    const className = cn(
      isMobile
        ? 'nav-mobile touch-target'
        : 'nav-desktop touch-target',
      active
        ? isMobile
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-primary/10 text-primary border-b-2 border-primary shadow-sm'
        : isMobile
          ? 'text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground focus:bg-muted/50 focus:text-foreground'
    );

    return (
      <Link
        href={item.href}
        className={className}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={active ? 'page' : undefined}
        role="menuitem"
        tabIndex={0}
      >
        <IconWrapper
          icon={item.icon}
          className={cn(
            isMobile ? 'mr-3' : 'mr-2',
            active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          )}
        />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <nav
      className="bg-background/95 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-wide">
        <div className="flex justify-between h-16">
          {/* Enhanced logo with better accessibility */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-responsive-xl font-serif font-bold text-primary hover:text-primary/80 focus:text-primary/80 transition-colors duration-200 touch-target-large"
              aria-label="FarmTrack home"
            >
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <span className="hidden sm:block">FarmTrack</span>
              <span className="sm:hidden">FT</span>
            </Link>
          </div>

          {/* Enhanced desktop navigation with better responsive breakpoints */}
          <div className="hidden md:ml-8 md:flex md:space-x-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Enhanced mobile menu button with better touch targets */}
          <div className="-mr-2 flex items-center md:hidden">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target-large"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced mobile menu with improved accessibility */}
      {mobileMenuOpen && (
        <div
          className="md:hidden bg-background/95 backdrop-blur-sm border-t border-border"
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="pt-2 pb-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.name} item={item} isMobile />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
