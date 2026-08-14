import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDragonDamage, freshDragonHealth, isDragonDefeated } from '../src/game/combat.js';

test('smok zaczyna planszę z trzema sercami', () => assert.equal(freshDragonHealth(), 3));
test('trzecie trafienie pokonuje smoka', () => {
  const health = applyDragonDamage(applyDragonDamage(applyDragonDamage(freshDragonHealth())));
  assert.equal(health, 0);
  assert.equal(isDragonDefeated(health), true);
});
