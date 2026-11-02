import { describe, expect, it } from 'vitest';
import { placeholderForRow } from '../src/shared/prefill';
import type { SetEntry } from '../src/shared/types';

describe('placeholderForRow', () => {
  const last: SetEntry[] = [
    { weightKg: 80, reps: 10 },
    { weightKg: 85, reps: 8 },
    { weightKg: 70, reps: 12 },
  ];

  it('usa la serie de la misma posición', () => {
    expect(placeholderForRow(last, 0)).toEqual({ weightKg: 80, reps: 10 });
    expect(placeholderForRow(last, 2)).toEqual({ weightKg: 70, reps: 12 });
  });

  it('repite la última serie cuando la fila no tiene correspondencia', () => {
    expect(placeholderForRow(last, 7)).toEqual({ weightKg: 70, reps: 12 });
  });

  it('devuelve null sin historial', () => {
    expect(placeholderForRow(undefined, 0)).toBeNull();
    expect(placeholderForRow(null, 3)).toBeNull();
    expect(placeholderForRow([], 0)).toBeNull();
  });
});
