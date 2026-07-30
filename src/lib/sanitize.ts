/**
 * Server-safe HTML sanitizer — zero DOM dependencies.
 *
 * Works in any JS runtime (Node, Edge, Vercel Serverless) because
 * it never touches JSDOM, window, or document.
 *
 * Strategy:
 *   1. Walk through the HTML string character-by-character to find tags.
 *   2. Keep only tags whose name is in ALLOWED_TAGS.
 *   3. Inside kept tags, keep only attributes in ALLOWED_ATTRS.
 *   4. Strip everything else (unknown tags are removed, their text content kept).
 */

const ALLOWED_TAGS = new Set([
  "b", "i", "em", "strong", "a", "p", "br",
  "ul", "ol", "li", "h2", "h3", "code", "pre",
]);

const ALLOWED_ATTRS = new Set(["href", "target", "rel"]);

// Self-closing tags that don't need a closing tag
const VOID_TAGS = new Set(["br"]);

/**
 * Sanitize an attribute value — prevents attribute injection / XSS via attributes.
 * Strips javascript: URIs and event handlers.
 */
function sanitizeAttrValue(name: string, value: string): string {
  if (name === "href") {
    const trimmed = value.trim().toLowerCase();
    // Block javascript:, data:, and vbscript: URIs
    if (
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("vbscript:")
    ) {
      return "";
    }
  }
  // Escape quotes in the value to prevent attribute breakout
  return value.replace(/"/g, "&quot;");
}

/**
 * Parse and filter attributes from a raw tag string.
 * Returns only allowed attributes with sanitized values.
 */
function filterAttributes(rawAttrs: string): string {
  const result: string[] = [];
  // Match attribute patterns: name="value", name='value', name=value, or name (boolean)
  const attrRegex = /([a-zA-Z][a-zA-Z0-9\-_]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let match;

  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const attrName = match[1].toLowerCase();
    if (!ALLOWED_ATTRS.has(attrName)) continue;

    const attrValue = match[2] ?? match[3] ?? match[4] ?? "";
    const sanitized = sanitizeAttrValue(attrName, attrValue);
    if (sanitized || attrName !== "href") {
      result.push(`${attrName}="${sanitized}"`);
    }
  }

  return result.length > 0 ? " " + result.join(" ") : "";
}

/**
 * Sanitize HTML string. Keeps only allowed tags and attributes.
 * All other tags are stripped (their text content is preserved).
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return "";

  let output = "";
  let i = 0;

  while (i < html.length) {
    if (html[i] === "<") {
      // Find the end of this tag
      const closeIdx = html.indexOf(">", i);
      if (closeIdx === -1) {
        // Malformed tag at end of string — escape the < and continue
        output += "&lt;";
        i++;
        continue;
      }

      const fullTag = html.substring(i + 1, closeIdx).trim();
      const isClosing = fullTag.startsWith("/");
      const tagContent = isClosing ? fullTag.substring(1).trim() : fullTag;

      // Extract tag name (everything before first space or end)
      const spaceIdx = tagContent.search(/[\s/]/);
      const tagName = (spaceIdx === -1 ? tagContent : tagContent.substring(0, spaceIdx))
        .toLowerCase()
        .replace(/\/$/, ""); // Remove trailing slash for self-closing

      if (tagName && ALLOWED_TAGS.has(tagName)) {
        if (isClosing) {
          output += `</${tagName}>`;
        } else {
          const rawAttrs = spaceIdx === -1 ? "" : tagContent.substring(spaceIdx);
          const filteredAttrs = filterAttributes(rawAttrs);
          const selfClosing = VOID_TAGS.has(tagName) || fullTag.endsWith("/");
          output += selfClosing
            ? `<${tagName}${filteredAttrs} />`
            : `<${tagName}${filteredAttrs}>`;
        }
      }
      // else: tag is not allowed — strip it (text content still kept)

      i = closeIdx + 1;
    } else {
      output += html[i];
      i++;
    }
  }

  return output;
}

/**
 * Sanitize HTML with the same rules, exposed with the specific config
 * matching what was previously used with DOMPurify.
 */
export function sanitizeAnnouncementHtml(html: string): string {
  return sanitizeHtml(html);
}
