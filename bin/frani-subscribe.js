#!/usr/bin/env node
// Frani Subscribe — CLI + daemon entrypoint.
// Made by CRYPTFRANI. Owner / creator: Itachi. Unicity testnet2 only.

import process from 'node:process';
import { config } from '../src/config.js';
import { Store } from '../src/store.js';
import { createSubscription, isDue, markPaid, cancel, renderSubscription } from '../src/subscribe.js';

export const HELP = `Frani Subscribe — recurring payments on Unicity testnet2

Usage:
  frani-subscribe new --payer <address> --payee <address> --amount <UCT> [--cadence weekly|monthly]
  frani-subscribe pay <subscriptionId> [--at <ISO date>]
  frani-subscribe due <subscriptionId> [--at <ISO date>]
  frani-subscribe cancel <subscriptionId>
  frani-subscribe list
  frani-subscribe about
  frani-subscribe help
`;

export const aboutText = `Frani Subscribe — consent-based recurring payments on Unicity testnet2.
Made by CRYPTFRANI. Owner / creator: Itachi.
`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) out[a.slice(2, eq)] = a.slice(eq + 1);
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i];
      else out[a.slice(2)] = true;
    } else out._.push(a);
  }
  return out;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const store = new Store(config.dataDir);

  switch (cmd) {
    case 'new': {
      const sub = createSubscription({
        payer: args.payer,
        payee: args.payee,
        amount: args.amount,
        cadence: args.cadence || 'monthly',
      });
      await store.save(sub);
      console.log(`Created ${renderSubscription(sub)}`);
      console.log(`Subscription id: ${sub.id}`);
      break;
    }
    case 'pay': {
      const sub = await store.get(rest[0]);
      const at = args.at ? new Date(args.at) : new Date();
      const round = markPaid(sub, at);
      await store.save(sub);
      console.log(`Paid round ${sub.paidRounds.length} (${round.paidAt}) — next due ${sub.nextDue}`);
      break;
    }
    case 'due': {
      const sub = await store.get(rest[0]);
      const at = args.at ? new Date(args.at) : new Date();
      console.log(isDue(sub, at) ? 'due' : 'not due');
      break;
    }
    case 'cancel': {
      const sub = await store.get(rest[0]);
      cancel(sub);
      await store.save(sub);
      console.log(`Cancelled ${sub.id}`);
      break;
    }
    case 'list': {
      const subs = await store.list();
      if (subs.length === 0) console.log('No subscriptions yet.');
      for (const s of subs) console.log(renderSubscription(s));
      break;
    }
    case 'about':
      console.log(aboutText);
      break;
    case 'help':
    case undefined:
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
