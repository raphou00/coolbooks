import { stripe } from "./stripe";

const createStripeProduct = async () => {
    const crushProduct = await stripe.products.create({
        id: "crush",
        name: "Crush",
    });

    await stripe.prices.create({
        product: crushProduct.id,
        unit_amount: 500,
        currency: "usd",
        recurring: {
            interval: "month",
            trial_period_days: 7,
        },
    });

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
