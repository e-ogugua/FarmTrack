'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
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
        ? 'block px-4 py-2 text-base font-medium transition-colors group flex items-center'
        : 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group',
      active
        ? isMobile
          ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
          : 'bg-green-50 text-green-700 border-b-2 border-green-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
            active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'
          )} 
        />
        {item.name}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">
              FarmTrack
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
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
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.name} item={item} isMobile />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
