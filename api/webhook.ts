import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const getRawBody = async (req: VercelRequest) => {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  return Buffer.concat(buffers);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!stripeKey || !webhookSecret) {
    console.error('Missing Stripe webhook configuration in environment variables.');
    return res.status(500).json({ error: 'Missing Stripe webhook environment variables' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration in environment variables.');
    return res.status(500).json({ error: 'Missing Supabase environment variables' });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const payload = await getRawBody(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.log(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (userId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_id: session.subscription as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (error) console.error('Error updating supabase:', error);
        }
        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
           const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'free',
              updated_at: new Date().toISOString()
            })
            .eq('subscription_id', subscription.id);
            
           if (error) console.error('Error updating supabase disable:', error);
        } else if (subscription.status === 'active') {
           const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('subscription_id', subscription.id);
            
           if (error) console.error('Error updating supabase activate:', error);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: err.message });
  }
}
