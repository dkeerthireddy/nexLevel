// Environment variable checker for Vercel debugging
// This can be called via GraphQL query to check env vars on deployed environment

export function checkEnvironmentVariables() {
  const envCheck = {
    ADMIN_EMAIL: {
      exists: !!process.env.ADMIN_EMAIL,
      value: process.env.ADMIN_EMAIL ? `${process.env.ADMIN_EMAIL.substring(0, 3)}***@${process.env.ADMIN_EMAIL.split('@')[1]}` : 'NOT SET',
      length: process.env.ADMIN_EMAIL?.length || 0
    },
    ADMIN_EMAIL_PASSWORD: {
      exists: !!process.env.ADMIN_EMAIL_PASSWORD,
      length: process.env.ADMIN_EMAIL_PASSWORD?.length || 0,
      value: process.env.ADMIN_EMAIL_PASSWORD ? `${'*'.repeat(process.env.ADMIN_EMAIL_PASSWORD.length)}` : 'NOT SET'
    },
    CORS_ORIGIN: {
      exists: !!process.env.CORS_ORIGIN,
      value: process.env.CORS_ORIGIN || 'NOT SET'
    },
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    MONGODB_URI: {
      exists: !!process.env.MONGODB_URI,
      value: process.env.MONGODB_URI ? 'SET (hidden)' : 'NOT SET'
    }
  };

  console.log('🔍 Environment Variables Check:', JSON.stringify(envCheck, null, 2));
  return envCheck;
}
