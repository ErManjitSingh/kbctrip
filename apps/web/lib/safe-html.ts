export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Allow only safe bot HTML (links + basic emphasis) from our own templates. */
export function sanitizeTrustedBotHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|form|input|img|svg)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|form|input|img|svg)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/href\s*=\s*("(?!https?:\/\/)[^"]*"|'(?!https?:\/\/)[^']*')/gi, 'href="#"');
}
