// Reduces rich-text HTML (as produced by the Tiptap page-content editor) down to plain text —
// used everywhere a page's title/content is reused as a plain label rather than rendered as
// markup (nav menu links, the browser <title> tag, JSON-LD breadcrumbs, meta descriptions, the
// admin pages list). Block-level tags collapse to a single space so "one <strong>day</strong>"
// doesn't become "onedayday"-style run-ons; entities are decoded last so a literal "&amp;" in the
// source renders as "&" rather than leaking the escape sequence into plain-text contexts.
export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote|br|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// The "inline" rich-text editor variant (used for page titles) disables every block-level node
// except the one paragraph Tiptap's schema always wraps a document in — so its HTML is always
// exactly "<p>...</p>". Unwrapping that before dropping it into an <h1> avoids nesting a block
// element inside a heading, which is invalid HTML and gets silently "fixed" by the browser in ways
// that break the heading's styling.
export function unwrapParagraph(html: string): string {
  const match = html.match(/^<p>([\s\S]*)<\/p>$/i)
  return match ? match[1] : html
}
