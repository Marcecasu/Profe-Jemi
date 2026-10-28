import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Planes oficiales configurados
const PRICE_MAP: Record<string, string> = {
  // Global (USD)
  global_monthly: 'price_1UQpezAJMdprx7K9ahv8B6em',
  global_annual: 'price_1UQps4AJMdprx7K9DmXFEVXU',
  // Brasil (BRL)
  brazil_monthly: 'price_1UQqTBAJMdprx7K92g1Rhk5H',
  brazil_annual: 'price_1UQqWtAJMdprx7K9y2aYI0JF',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('Missing STRIPE_SECRET_KEY in environment variables');
    return res.status(500).json({
      statusCode: 500,
      code: 'MISSING_STRIPE_KEY',
      message: 'Falta configurar la variable STRIPE_SECRET_KEY en Vercel (Project Settings > Environment Variables).'
    });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  const { email, userId, priceId, planKey } = req.body || {};

  // Determinar el priceId adecuado
  let selectedPrice = priceId;
  if (!selectedPrice && planKey && PRICE_MAP[planKey]) {
    selectedPrice = PRICE_MAP[planKey];
  }
  // Si no se envió ninguno o no es válido, por defecto Global Mensual
  if (!selectedPrice || !Object.values(PRICE_MAP).includes(selectedPrice)) {
    selectedPrice = PRICE_MAP.global_monthly;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPrice,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'https://app.hablemosenespanol.com'}/?success=true`,
      cancel_url: `${req.headers.origin || 'https://app.hablemosenespanol.com'}/?canceled=true`,
      customer_email: email || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        userId: userId || '',
        selectedPrice,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
}
