import { marked, type RendererObject } from 'marked'
import DOMPurify from 'dompurify'

// Custom renderer: route mermaid code blocks to mermaid containers
const renderer: RendererObject = {
  code({ text, lang }: { text: string; lang?: string }) {
    if (lang === 'mermaid') {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<div class="mermaid-container"><pre class="mermaid">${escaped}</pre></div>`
    }
    return false
  },
}

marked.use({ renderer })

export function renderMarkdown(markdown: string): string {
  const html = marked.parse(markdown) as string
  return DOMPurify.sanitize(html)
}
