import { describe, it, expect } from 'vitest';
import { cn } from '../utils/cn';

describe('cn utility', () => {
  it('joins multiple class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(cn('a', false, 'b', null, 'c', undefined)).toBe('a b c');
  });

  it('returns empty string when no truthy values', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  it('handles single class name', () => {
    expect(cn('single')).toBe('single');
  });

  it('handles empty arguments', () => {
    expect(cn()).toBe('');
  });

  it('handles mixed types', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
  });
});
