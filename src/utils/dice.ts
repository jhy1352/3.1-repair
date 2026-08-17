import { DCRecord } from '../types/trpg';

/**
 * CSPRNG Cryptographically Secure Random Number Generator
 * Uses window.crypto.getRandomValues()
 */
export function rollCryptoDie(sides: number): number {
  if (sides <= 0) return 1;
  const array = new Uint32Array(1);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
    return (array[0] % sides) + 1;
  }
  // Server-side fallback with Node crypto if available
  try {
    const cryptoNode = (globalThis as unknown as { crypto?: { getRandomValues?: (arr: Uint32Array) => Uint32Array } }).crypto;
    if (cryptoNode?.getRandomValues) {
      cryptoNode.getRandomValues(array);
      return (array[0] % sides) + 1;
    }
  } catch {
    // fallback
  }
  return Math.floor(Math.random() * sides) + 1;
}

export interface CheckOutcome {
  outcome: 'miraculous_success' | 'great_success' | 'success' | 'narrow_success' | 'narrow_failure' | 'failure' | 'great_failure' | 'fatal_failure';
  isSuccess: boolean;
  label: string;
  colorClass: string;
  diff: number;
}

/**
 * Evaluates DC Check according to TRPG Engine Spec (Rev 3.1):
 * - Raw 1: Fatal failure regardless of modifier
 * - Raw 20: Miraculous success regardless of modifier
 * - Diff <= 3: Narrow success / failure
 * - Diff 4..6: Normal success / failure
 * - Diff >= 7: Great success / failure
 */
export function evaluateDCCheck(rawRoll: number, modifier: number, targetDC: number): CheckOutcome {
  const total = rawRoll + modifier;
  const diff = Math.abs(total - targetDC);
  const isSuccess = total >= targetDC;

  if (rawRoll === 1) {
    return {
      outcome: 'fatal_failure',
      isSuccess: false,
      label: '치명적 실패 (대참사 / Raw 1)',
      colorClass: 'text-red-600 bg-red-950/20 border-red-500/50',
      diff,
    };
  }

  if (rawRoll === 20) {
    return {
      outcome: 'miraculous_success',
      isSuccess: true,
      label: '기적적인 성공 (대성공 / Raw 20)',
      colorClass: 'text-amber-400 bg-amber-950/20 border-amber-500/50',
      diff,
    };
  }

  if (isSuccess) {
    if (diff >= 7) {
      return {
        outcome: 'great_success',
        isSuccess: true,
        label: `대성공 (차이 +${diff})`,
        colorClass: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/50',
        diff,
      };
    } else if (diff >= 4) {
      return {
        outcome: 'success',
        isSuccess: true,
        label: `성공 (차이 +${diff})`,
        colorClass: 'text-teal-300 bg-teal-950/20 border-teal-500/50',
        diff,
      };
    } else {
      return {
        outcome: 'narrow_success',
        isSuccess: true,
        label: `아슬아슬한 성공 (차이 +${diff})`,
        colorClass: 'text-sky-300 bg-sky-950/20 border-sky-500/50',
        diff,
      };
    }
  } else {
    if (diff >= 7) {
      return {
        outcome: 'great_failure',
        isSuccess: false,
        label: `대실패 (차이 -${diff})`,
        colorClass: 'text-rose-500 bg-rose-950/20 border-rose-500/50',
        diff,
      };
    } else if (diff >= 4) {
      return {
        outcome: 'failure',
        isSuccess: false,
        label: `실패 (차이 -${diff})`,
        colorClass: 'text-orange-400 bg-orange-950/20 border-orange-500/50',
        diff,
      };
    } else {
      return {
        outcome: 'narrow_failure',
        isSuccess: false,
        label: `아슬아슬한 실패 (차이 -${diff})`,
        colorClass: 'text-yellow-400 bg-yellow-950/20 border-yellow-500/50',
        diff,
      };
    }
  }
}

/**
 * Calculates long-term DC distribution stats (Target range 5 to 15)
 */
export function calculateDCDistribution(records: DCRecord[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  for (let dc = 5; dc <= 15; dc++) {
    distribution[dc] = 0;
  }
  for (const rec of records) {
    if (rec.targetDC >= 5 && rec.targetDC <= 15) {
      distribution[rec.targetDC] = (distribution[rec.targetDC] || 0) + 1;
    }
  }
  return distribution;
}

/**
 * Generate 6-digit sync code (e.g. X9K2A7) using CSPRNG
 */
export function generateSyncCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  const array = new Uint8Array(6);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 6; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < 6; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
