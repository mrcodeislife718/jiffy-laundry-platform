import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Node
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-min-32-chars-required!',

  // Email
  resendApiKey: process.env.RESEND_API_KEY || '',

  // Expo
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN || '',

  // Flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required env vars
if (env.isProduction) {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REDIS_URL',
    'STRIPE_SECRET_KEY',
    'JWT_SECRET',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
