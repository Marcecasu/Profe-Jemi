require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors());
// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PORT = 4242;

app.get('/', (req, res) => {
    res.send('Profe Jemi API is running! 🚀');
});

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
    const { priceId, userId, userEmail } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/courses`,
            customer_email: userEmail,
            metadata: {
                userId: userId,
            },
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook Handler
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.metadata.userId;
            const customerId = session.customer;

            console.log(`Payment successful for user ${userId}`);

            // Update Supabase
            const { error } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    stripe_customer_id: customerId,
                    trial_ends_at: null // Clear trial end date as they are now active
                })
                .eq('id', userId);

            if (error) console.error('Error updating Supabase:', error);
            break;

        case 'customer.subscription.deleted':
            // Handle cancellation
            // Logic to revert status to 'canceled' or 'past_due'
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
