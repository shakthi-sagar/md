import LZString from 'lz-string'

// Base64url helpers (URL-safe, no padding)
function toBase64Url(uint8Array: Uint8Array): string {
  const binStr = Array.from(uint8Array, (b) => String.fromCharCode(b)).join('')
  return btoa(binStr)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const binStr = atob(base64)
  return Uint8Array.from(binStr, (c) => c.charCodeAt(0))
}

// Native deflate compression
export async function compressContent(content: string): Promise<string | null> {
  try {
    const stream = new Blob([new TextEncoder().encode(content) as unknown as BlobPart])
      .stream()
      .pipeThrough(new CompressionStream('deflate-raw'))
    const buf = await new Response(stream).arrayBuffer()
    const compressed = new Uint8Array(buf)
    return 'z.' + toBase64Url(compressed)
  } catch (e) {
    console.error('Failed to compress content:', e)
    return null
  }
}

// Decompress — handles new deflate format, old LZ-String, and old base64
export async function decompressContent(encoded: string): Promise<string | null> {
  try {
    // New deflate-raw format (prefixed with "z.")
    if (encoded.startsWith('z.')) {
      const bytes = fromBase64Url(encoded.slice(2))
      const stream = new Blob([bytes as unknown as BlobPart])
        .stream()
        .pipeThrough(new DecompressionStream('deflate-raw'))
      return await new Response(stream).text()
    }

    // Legacy: try LZ-String
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(encoded)
      if (decompressed) return decompressed
    } catch {
      /* fall through */
    }

    // Legacy: try plain base64
    try {
      return decodeURIComponent(escape(atob(encoded)))
    } catch {
      /* fall through */
    }

    return null
  } catch (e) {
    console.error('Failed to decompress content:', e)
    return null
  }
}
