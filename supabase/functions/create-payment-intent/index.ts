import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const stripe_secret_key = Deno.env.get("STRIPE_SECRET_KEY");

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Parse request body
    const { amount, orderId } = await req.json();

    // Validate required fields
    if (!amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing amount or orderId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Amount must be greater than 0" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate Stripe secret key is set
    if (!stripe_secret_key) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // Create Stripe PaymentIntent
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripe_secret_key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(amountInCents),
        currency: "usd",
        metadata: {
          orderId,
        },
      }).toString(),
    });

    const stripeResponse = await response.json();

    // Handle Stripe API errors
    if (!response.ok) {
      console.error("Stripe error:", stripeResponse);
      return new Response(
        JSON.stringify({ error: "Failed to create payment intent" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return client secret
    return new Response(
      JSON.stringify({ clientSecret: stripeResponse.client_secret }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
