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

import { rewrite, next, geolocation } from '@vercel/functions';

// Only run on the homepage. Assets, /scan, /dashboard, /api/*, and every other
// page are left completely untouched.
export const config = {
  matcher: '/',
};

// The homepage is region-specific, so it must NOT be served from a single
// shared CDN cache (or the first visitor's country would "stick" for everyone).
const NO_CACHE = { 'Cache-Control': 'no-store, must-revalidate' };

export default function middleware(request) {
  const { country } = geolocation(request);

  // Pakistan → serve the local page as-is (index.html), uncached.
  if (country === 'PK') {
    return next({ headers: NO_CACHE });
  }

  // Everyone else → serve the international page, keeping the URL as "/", uncached.
  return rewrite(new URL('/index-global.html', request.url), { headers: NO_CACHE });
}
