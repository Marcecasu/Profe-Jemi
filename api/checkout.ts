import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as any,
});

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, userId, priceId, planKey } = req.body;

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
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId: userId || '',
        selectedPrice,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ statusCode: 500, message: err.message });
  }
}
