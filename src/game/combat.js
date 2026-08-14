import { DRAGON_HEALTH } from './constants.js';

export function applyDragonDamage(health, amount = 1) {
  return Math.max(0, health - amount);
}

export function isDragonDefeated(health) {
  return health <= 0;
}

export function freshDragonHealth() {
  return DRAGON_HEALTH;
}
