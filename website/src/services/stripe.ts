interface CheckoutParams {
  price_id: string;
  success_url: string;
  cancel_url: string;
  mode: 'subscription' | 'payment';
}

interface CheckoutResponse {
  sessionId?: string;
  url?: string;
  error?: string;
}

// Mock subscription data for demo
const MOCK_SUBSCRIPTION = {
  subscription_id: 'sub_123456',
  subscription_status: 'active',
  price_id: 'price_1RT5AWP2PbtSdcjR7gzU3BQx',
  current_period_start: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  cancel_at_period_end: false,
  payment_method_brand: 'visa',
  payment_method_last4: '4242'
};

export async function createCheckoutSession(params: CheckoutParams): Promise<CheckoutResponse> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would call a Stripe API
    // For demonstration, we'll return a mock checkout URL
    return {
      sessionId: 'cs_test_' + Math.random().toString(36).substring(2, 15),
      url: params.success_url // Simulate immediately going to success URL
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Add caching for subscription status
let cachedSubscription: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSubscriptionStatus() {
  try {
    // Check if we have a cached and valid subscription
    const now = Date.now();
    if (cachedSubscription && (now - lastFetchTime < CACHE_TTL)) {
      return cachedSubscription;
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Cache the result
    cachedSubscription = MOCK_SUBSCRIPTION;
    lastFetchTime = now;
    
    return MOCK_SUBSCRIPTION;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw error;
  }
}

// Also add pagination to order history
export async function getOrderHistory(page = 1, pageSize = 10) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock orders data
    const mockOrders = Array.from({ length: 15 }, (_, i) => ({
      order_id: `order-${i + 1}`,
      checkout_session_id: `cs_test_${Math.random().toString(36).substring(2, 15)}`,
      payment_intent_id: `pi_test_${Math.random().toString(36).substring(2, 15)}`,
      amount_subtotal: 24900,
      amount_total: 24900,
      currency: 'usd',
      payment_status: 'paid',
      order_status: 'completed',
      order_date: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    }));
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrders = mockOrders.slice(startIndex, endIndex);
    
    return {
      orders: paginatedOrders,
      totalCount: mockOrders.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockOrders.length / pageSize)
    };
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
}

// Add a function to clear the subscription cache when needed
export function clearSubscriptionCache() {
  cachedSubscription = null;
  lastFetchTime = 0;
}