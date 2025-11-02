export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'

  const options= {
    httpOnly: true,
    secure: isProduction, // must be true when using HTTPS
    sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-domain cookies
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined, // e.g. '.example.com'
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };

  // Debug logging
  console.log('Cookie options:', {
    ...options,
    environment: process.env.NODE_ENV,
    cookieDomain: process.env.COOKIE_DOMAIN,
  })

  return options
}