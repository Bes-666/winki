import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';

export function middleware(request: NextRequest) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const result = rateLimit(`api-${ip}`, 100, 60000); // 100 requests per minute

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};


