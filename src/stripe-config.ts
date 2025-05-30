export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const products: StripeProduct[] = [
  {
    priceId: 'price_1RT5AWP2PbtSdcjR7gzU3BQx',
    name: 'AgentEcos Pro Subscription',
    description: 'Unlock full access to the AgentEcos AI agent ecosystem management platform. Includes advanced hierarchical agent orchestration, industry blueprints, visualization tools, and priority support.',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return products.find(product => product.priceId === priceId);
};