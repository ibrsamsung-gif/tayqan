/// <reference types="vite/client" />

/**
 * Safely resolves asset paths for local development, production, and GitHub Pages (subpath hosting)
 */
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const clean = path.replace(/^\.?\//, '');
  const base = import.meta.env.BASE_URL || './';
  return `${base.endsWith('/') ? base : base + '/'}${clean}`;
};
