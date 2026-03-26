import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeUrl = process.env.STRIPE_SECRET_KEY as string;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const stripe = new Stripe(stripeUrl, {
  apiVersion: '2025-02-24.acacia' as any,
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  const payload = await getRawBody(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
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
              subscription_status: 'inactive',
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

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}
