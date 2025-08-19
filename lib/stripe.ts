import Stripe from 'stripe'
const apiVersion = (process.env.STRIPE_API_VERSION ?? '2025-07-30.basil') as Stripe.LatestApiVersion
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion })
