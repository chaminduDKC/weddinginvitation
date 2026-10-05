/**
 * Device capability detector for mobile performance optimization.
 * Detects low-memory/low-core mobile devices and prefers-reduced-motion to
 * disable non-essential visual extras like falling petals or heavy particle meshes.
 */

interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
}

export const isWeakDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return true;

  const extNav = navigator as ExtendedNavigator;

  // 2. Check RAM if exposed by Chromium (< 4GB is considered low-tier for heavy canvas/DOM loops)
  if (extNav.deviceMemory && extNav.deviceMemory < 4) {
    return true;
  }

  // 3. Check CPU concurrency if available (< 4 cores indicates entry-level CPU)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }

  return false;
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
