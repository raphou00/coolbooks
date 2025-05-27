import { stripe } from "./stripe";

const createStripeProduct = async () => {
    const loverProduct = await stripe.products.create({
        id: "lover",
        name: "Lover",
    });

    return await stripe.prices.create({
        product: loverProduct.id,
        unit_amount: 800,
        currency: "usd",
        recurring: {
            interval: "month",
            trial_period_days: 7,
        },
    });
};

export { createStripeProduct };
