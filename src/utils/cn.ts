/**
 * Simple utility for conditional className joining
 * Alternative to clsx or classnames for minimal dependencies
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
