import type { SetEntry } from './types';

/**
 * Placeholder de una fila de series a partir del último registro del
 * ejercicio: la serie en la misma posición y, si esa vez hubo menos series,
 * la última disponible. Sin historial devuelve null (la UI muestra 0).
 */
export function placeholderForRow(
  lastSets: SetEntry[] | null | undefined,
  rowIndex: number,
): SetEntry | null {
  if (!lastSets || lastSets.length === 0) return null;
  return lastSets[rowIndex] ?? lastSets[lastSets.length - 1] ?? null;
}
