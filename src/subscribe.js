// Frani Subscribe — recurring payments domain logic.
// A payer consents to a periodic amount. Each period, a payment is due; the
// subscription tracks which rounds have been paid and can be cancelled.

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

const CADENCES = { weekly: 7, monthly: 30 };

export function createSubscription({ payer, payee, amount, cadence = 'monthly', start = new Date() }) {
  if (!payer) throw new Error('a subscription needs a payer');
  if (!payee) throw new Error('a subscription needs a payee');
  if (!(cadence in CADENCES)) throw new Error('cadence must be weekly or monthly');
  const base = Number(amount);
  if (!Number.isFinite(base) || base <= 0) throw new Error('amount must be positive');
  return {
    id: newId('sub'),
    payer,
    payee,
    amount: String(base),
    cadence,
    start: new Date(start).toISOString(),
    nextDue: new Date(start).toISOString(),
    active: true,
    paidRounds: [],
    createdAt: new Date().toISOString(),
  };
}

function addDays(iso, days) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function isDue(subscription, now = new Date()) {
  if (!subscription.active) return false;
  return new Date(now) >= new Date(subscription.nextDue);
}

export function markPaid(subscription, now = new Date()) {
  if (!subscription) throw new Error('subscription not found');
  if (!isDue(subscription, now)) throw new Error('not due yet');
  const round = {
    paidAt: new Date(now).toISOString(),
    periodStart: subscription.nextDue,
    amount: subscription.amount,
  };
  subscription.paidRounds.push(round);
  subscription.nextDue = addDays(subscription.nextDue, CADENCES[subscription.cadence]);
  return round;
}

export function cancel(subscription) {
  if (!subscription) throw new Error('subscription not found');
  subscription.active = false;
  subscription.cancelledAt = new Date().toISOString();
  return subscription;
}

export function renderSubscription(subscription) {
  const rounds = subscription.paidRounds.length;
  const status = subscription.active ? 'active' : 'cancelled';
  return `${subscription.id} · ${subscription.payer} → ${subscription.payee} · ${subscription.amount} UCT/${subscription.cadence} · ${rounds} paid · ${status}`;
}
