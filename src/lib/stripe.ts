/**
 * Stripe Server-Side Functions for Checkout
 *
 * Uses Qwik's server$ for secure API calls that never expose the secret key.
 * PaymentIntent flow with Stripe Elements on the frontend.
 */

import { server$ } from '@builder.io/qwik-city';
import Stripe from 'stripe';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CreatePaymentIntentInput {
  amountCents: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface VerifyPaymentResult {
  status: Stripe.PaymentIntent.Status;
  amount: number;
  metadata: Stripe.Metadata;
  receiptEmail: string | null;
}

// ============================================================================
// Server Functions
// ============================================================================

/**
 * Create a PaymentIntent for checkout
 * Called when user loads checkout page
 */
export const createPaymentIntent = server$(async function (
  input: CreatePaymentIntentInput
): Promise<PaymentIntentResult> {
  console.log('[stripe.ts] createPaymentIntent called, amount:', input.amountCents);
  const secretKey = this.platform?.env?.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('[stripe.ts] STRIPE_SECRET_KEY not found in env');
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  console.log('[stripe.ts] Secret key found, length:', secretKey.length);

  const stripe = new Stripe(secretKey);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: input.customerEmail,
      metadata: input.metadata || {},
    });

    console.log('[stripe.ts] PaymentIntent created:', paymentIntent.id);
    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (err: unknown) {
    console.error('[stripe.ts] Stripe API error:', err);
    throw err;
  }
});

/**
 * Update PaymentIntent with customer info before confirmation
 * Called when user submits shipping/billing form
 */
export const updatePaymentIntent = server$(async function (
  paymentIntentId: string,
  updates: {
    amount?: number;
    customerEmail?: string;
    metadata?: Record<string, string>;
    shippingAddress?: {
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  }
): Promise<void> {
  const secretKey = this.platform?.env?.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const stripe = new Stripe(secretKey);

  const updateParams: Stripe.PaymentIntentUpdateParams = {};

  if (updates.amount !== undefined) {
    updateParams.amount = updates.amount;
  }

  if (updates.customerEmail) {
    updateParams.receipt_email = updates.customerEmail;
  }

  if (updates.metadata) {
    updateParams.metadata = updates.metadata;
  }

  if (updates.shippingAddress) {
    updateParams.shipping = {
      name: updates.shippingAddress.name,
      address: {
        line1: updates.shippingAddress.line1,
        line2: updates.shippingAddress.line2,
        city: updates.shippingAddress.city,
        state: updates.shippingAddress.state,
        postal_code: updates.shippingAddress.postal_code,
        country: updates.shippingAddress.country,
      },
    };
  }

  await stripe.paymentIntents.update(paymentIntentId, updateParams);
});

/**
 * Verify PaymentIntent status after redirect
 * Called on confirmation page to check payment was successful
 */
export const verifyPaymentIntent = server$(async function (
  paymentIntentId: string
): Promise<VerifyPaymentResult> {
  const secretKey = this.platform?.env?.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const stripe = new Stripe(secretKey);

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    metadata: paymentIntent.metadata,
    receiptEmail: paymentIntent.receipt_email,
  };
});

/**
 * Cancel a PaymentIntent (e.g., if user abandons checkout)
 */
export const cancelPaymentIntent = server$(async function (
  paymentIntentId: string
): Promise<void> {
  const secretKey = this.platform?.env?.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const stripe = new Stripe(secretKey);

  await stripe.paymentIntents.cancel(paymentIntentId);
});
