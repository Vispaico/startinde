/**
 * Payments — service ladder: digital, human, partner. Stripe for v1
 * (the one likely external dependency).
 */

export type ServiceType = 'digital' | 'human' | 'partner';

export type OrderStatus = 'pending' | 'paid' | 'fulfilling' | 'completed' | 'refunded' | 'cancelled';

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: ServiceType;
  priceCents: number | null;
  currency: string;
  stripePriceId: string | null;
  isSubscription: boolean;
  active: boolean;
}

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  status: OrderStatus;
  stripeSessionId: string | null;
  amountCents: number | null;
  createdAt: string;
}

/**
 * Service ladder from SPEC §10 (first paid product: Personal Germany
 * Readiness Report). Prices in EUR cents.
 */
export const SERVICE_LADDER: Record<string, { name: string; type: ServiceType; priceCents: number; isSubscription: boolean }> = {
  readiness_report: { name: 'Personal Germany Readiness Report', type: 'digital', priceCents: 2900, isSubscription: false },
  ai_document_check: { name: 'AI Document Check', type: 'digital', priceCents: 6900, isSubscription: false },
  expert_document_review: { name: 'Expert Document Review', type: 'human', priceCents: 19900, isSubscription: false },
  managed_package_basic: { name: 'Managed Package — Basic', type: 'human', priceCents: 30000, isSubscription: false },
  startinde_plus: { name: 'StartinDE Plus', type: 'digital', priceCents: 1990, isSubscription: true },
};

export function formatPrice(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
