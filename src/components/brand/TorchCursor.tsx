/**
 * Native no-op. The torch cursor is a web-only flourish — see TorchCursor.web.tsx.
 * Metro picks the .web.tsx file automatically when bundling for web.
 */
export function TorchCursor() {
  return null;
}
