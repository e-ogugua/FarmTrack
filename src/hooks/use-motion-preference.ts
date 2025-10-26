import { useEffect, useState } from 'react';

/**
 * Hook to detect user's motion preferences and provide animation controls
 * Respects the prefers-reduced-motion CSS media query for accessibility
 */
export function useMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Enhanced animation variants that respect motion preferences
 */
export const motionVariants = {
  // Container animations
  container: {
    hidden: { opacity: 0 },
    visible: (prefersReducedMotion: boolean) => ({
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        when: "beforeChildren",
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    })
  },

  // Card animations
  card: {
    hidden: (prefersReducedMotion: boolean) => ({
      opacity: 0,
      y: prefersReducedMotion ? 0 : 20
    }),
    visible: (prefersReducedMotion: boolean) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: prefersReducedMotion ? undefined : [0.4, 0, 0.2, 1]
      }
    })
  },

  // Fade animations
  fade: {
    hidden: { opacity: 0 },
    visible: (prefersReducedMotion: boolean) => ({
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3
      }
    })
  },

  // Slide animations
  slide: {
    hidden: () => ({
      opacity: 0,
      y: 20
    }),
    visible: (prefersReducedMotion: boolean) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4
      }
    })
  },

  // Scale animations
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (prefersReducedMotion: boolean) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: prefersReducedMotion ? undefined : [0.4, 0, 0.2, 1]
      }
    })
  }
};

/**
 * Enhanced Framer Motion component props that include motion preferences
 */
export interface MotionProps {
  prefersReducedMotion: boolean;
  delay?: number;
  duration?: number;
}
