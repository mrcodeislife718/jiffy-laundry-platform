import Stripe from 'stripe';
import { env } from './env';

if (!env.stripeSecretKey) {
  throw new Error('Missing Stripe secret key configuration');
}

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const stripeConfig = {
  secretKey: env.stripeSecretKey,
  publishableKey: env.stripePublishableKey,
  webhookSecret: env.stripeWebhookSecret,
};
