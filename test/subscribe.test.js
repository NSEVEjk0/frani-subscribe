// Frani Subscribe — unit tests (plain node).
import assert from 'node:assert/strict';
import { createSubscription, isDue, markPaid, cancel } from '../src/subscribe.js';

const start = new Date('2026-10-01T00:00:00Z');
const sub = createSubscription({ payer: '0xP', payee: '0xE', amount: '10', cadence: 'weekly', start });

assert.equal(sub.active, true);
assert.equal(sub.cadence, 'weekly');

// not due before start
assert.equal(isDue(sub, new Date('2026-09-30T00:00:00Z')), false);

// due at start
assert.equal(isDue(sub, start), true);

// pay advances nextDue by 7 days
markPaid(sub, new Date('2026-10-01T12:00:00Z'));
assert.equal(sub.paidRounds.length, 1);
assert.equal(new Date(sub.nextDue).toISOString(), '2026-10-08T00:00:00.000Z');

// not due again until next period
assert.equal(isDue(sub, new Date('2026-10-05T00:00:00Z')), false);
assert.equal(isDue(sub, new Date('2026-10-08T00:00:00Z')), true);

// cannot pay early
assert.throws(() => markPaid(sub, new Date('2026-10-05T00:00:00Z')), /not due/);

// cancel stops dues
cancel(sub);
assert.equal(sub.active, false);
assert.equal(isDue(sub, new Date('2026-10-20T00:00:00Z')), false);

console.log('subscribe.test.js — all passed');
