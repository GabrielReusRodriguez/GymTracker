import { describe, expect, it } from 'vitest';
import { parseBackup } from '../src/shared/export';

function backup(version: number, session: Record<string, unknown>): string {
  return JSON.stringify({
    format: 'gym-tracker',
    version,
    exportedAt: '2026-01-01T00:00:00.000Z',
    user: { email: 'ana@example.com', name: 'Ana' },
    exercises: [],
    sessions: [session],
    templates: [],
  });
}

const sessionBase = {
  date: '2026-01-05',
  notes: null,
  logs: [],
};

describe('parseBackup', () => {
  it('normaliza a null el peso corporal ausente en backups v2', () => {
    const parsed = parseBackup(backup(2, sessionBase));
    expect(parsed.version).toBe(2);
    expect(parsed.sessions[0]!.bodyWeightKg).toBeNull();
  });

  it('lee el peso corporal de un backup v3', () => {
    const parsed = parseBackup(backup(3, { ...sessionBase, bodyWeightKg: 78.4 }));
    expect(parsed.version).toBe(3);
    expect(parsed.sessions[0]!.bodyWeightKg).toBe(78.4);
  });

  it('ignora un peso corporal que no es número', () => {
    const parsed = parseBackup(backup(3, { ...sessionBase, bodyWeightKg: 'mucho' }));
    expect(parsed.sessions[0]!.bodyWeightKg).toBeNull();
  });
});
