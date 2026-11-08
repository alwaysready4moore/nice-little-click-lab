import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
// GA4 gtag.js hosts from Google's CSP guide (Analytics without Ads features). Production only.
const ga4ScriptSrc = isDevelopment ? "" : " https://www.googletagmanager.com";
const ga4ImgSrc = isDevelopment ? "" : " https://www.googletagmanager.com https://*.google-analytics.com";
const ga4ConnectSrc = isDevelopment
  ? ""
  : " https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ga4ScriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${ga4ImgSrc}`,
  "font-src 'self' data:",
  "media-src 'self' blob:",
  `connect-src 'self'${ga4ConnectSrc}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
