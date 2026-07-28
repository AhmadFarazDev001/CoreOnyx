import DOMPurify from 'isomorphic-dompurify';

/**
 * Safely sanitizes HTML for rendering.
 * Uses isomorphic-dompurify to work correctly on both server and client.
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}
