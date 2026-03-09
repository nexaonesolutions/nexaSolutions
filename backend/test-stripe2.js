const Stripe = require('stripe');
require('dotenv').config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'boleto'],
            mode: 'subscription',
            line_items: [
                {
                    price_data: { currency: 'brl', product_data: { name: 'Manutencao' }, recurring: { interval: 'month' }, unit_amount: 10000 },
                    quantity: 1,
                },
                {
                    price_data: { currency: 'brl', product_data: { name: 'Setup' }, unit_amount: 150000 },
                    quantity: 1,
                }
            ],
            subscription_data: { trial_period_days: 30 },
            success_url: 'http://localhost/success',
            cancel_url: 'http://localhost/cancel'
        });
        console.log("Success:", session.id);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

run();
