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
 * Main navigation bar component that displays the primary navigation links.
 * Features responsive design and active state indicators.
 */
export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Determines if a navigation item is currently active
   * @param path - The path to check against the current route
   * @returns Boolean indicating if the path is active
   */
  const isActive = useMemo(() => (path: string) => {
    // Handle exact matches and sub-paths
    return pathname === path ||
           (path !== '/' && pathname.startsWith(`${path}/`));
  }, [pathname]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Navigation item component
  const NavItem = ({ item, isMobile = false }: { item: typeof NAV_ITEMS[number]; isMobile?: boolean }) => {
    const active = isActive(item.href);
    const className = cn(
      isMobile
        ? 'block px-4 py-3 text-base font-medium transition-all duration-200 group flex items-center rounded-lg mx-2'
        : 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group mx-1',
      active
        ? isMobile
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-primary/10 text-primary border-b-2 border-primary shadow-sm'
        : isMobile
          ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    );

    return (
      <Link
        href={item.href}
        className={className}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={active ? 'page' : undefined}
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
    <nav className="bg-background/95 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 text-xl font-serif font-bold text-primary hover:text-primary/80 transition-colors duration-200">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <span>FarmTrack</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Toggle menu"
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-background/95 backdrop-blur-sm border-t border-border">
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
