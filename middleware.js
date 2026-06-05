// Vercel Routing/Edge Middleware — region-aware homepage.
//
// Pakistan visitors get the local homepage (index.html, PKR-friendly pricing).
// Everyone else gets the international homepage (index-global.html, USD pricing).
// The decision happens at the edge BEFORE the page is served, and we REWRITE
// (not redirect), so the URL stays "/" and a non-PK visitor never receives the
// Pakistan page or its pricing.
//
// Geo is best-effort: a VPN can change the detected country. That's unavoidable
// on a public site and acceptable for normal visitors.

import { rewrite, next } from '@vercel/edge';

// Only run on the homepage. Assets, /scan, /dashboard, /api/*, and every other
// page are left completely untouched.
export const config = {
  matcher: ['/'],
};

export default function middleware(request) {
  const country = request.headers.get('x-vercel-ip-country') || '';

  // Pakistan → serve the local page as-is.
  if (country === 'PK') {
    return next();
  }

  // Everyone else → serve the international page, keeping the URL as "/".
  return rewrite(new URL('/index-global.html', request.url));
}
