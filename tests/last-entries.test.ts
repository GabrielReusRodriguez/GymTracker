import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Exercise } from '../src/db/schema';
import { createTestDb, type TestDb } from './helpers/sqljs';
import { createUser } from '../src/db/repositories/users';
import { listAllExercisesForUser } from '../src/db/repositories/exercises';
import { saveSession } from '../src/db/repositories/sessions';
import { getLastEntriesByExercise } from '../src/db/repositories/templates';

let db: TestDb;

beforeEach(async () => {
  db = await createTestDb();
});

afterEach(() => {
  db.close();
});

async function makeUser(email: string): Promise<number> {
  const user = await createUser(db.handle, { email, name: 'Test', password: 'contraseña-segura' });
  return user.id;
}

async function globalByLibraryId(userId: number, libraryId: string): Promise<Exercise> {
  const all = await listAllExercisesForUser(db.handle, userId);
  const found = all.find((exercise) => exercise.libraryId === libraryId);
  if (!found) throw new Error(`No existe el ejercicio global ${libraryId}`);
  return found;
}

describe('getLastEntriesByExercise', () => {
  it('devuelve el último registro anterior a la fecha excluida', async () => {
    const userId = await makeUser('historial@example.com');
    const press = await globalByLibraryId(userId, 'barbell-bench-press');

    for (const [date, weight, reps] of [
      ['2026-01-05', 70, 8],
      ['2026-02-10', 90, 2],
      ['2026-03-01', 95, 1],
    ] as const) {
      await saveSession(db.handle, userId, {
        date,
        notes: null,
        bodyWeightKg: null,
        logs: [
          {
            exerciseId: press.id,
            durationMin: null,
            distanceKm: null,
            sets: [{ weightKg: weight, reps }],
          },
        ],
      });
    }

    const before = await getLastEntriesByExercise(db.handle, userId, [press.id], {
      excludeDate: '2026-03-01',
    });
    expect(before.get(press.id)).toMatchObject({
      date: '2026-02-10',
      sets: [{ weightKg: 90, reps: 2 }],
    });

    const all = await getLastEntriesByExercise(db.handle, userId, [press.id]);
    expect(all.get(press.id)?.date).toBe('2026-03-01');
  });

  it('no mezcla el historial de otros usuarios', async () => {
    const userId = await makeUser('propio@example.com');
    const otherId = await makeUser('ajeno@example.com');
    const press = await globalByLibraryId(userId, 'barbell-bench-press');

    await saveSession(db.handle, userId, {
      date: '2026-01-05',
      notes: null,
      bodyWeightKg: null,
      logs: [
        {
          exerciseId: press.id,
          durationMin: null,
          distanceKm: null,
          sets: [{ weightKg: 70, reps: 8 }],
        },
      ],
    });
    await saveSession(db.handle, otherId, {
      date: '2026-02-01',
      notes: null,
      bodyWeightKg: null,
      logs: [
        {
          exerciseId: press.id,
          durationMin: null,
          distanceKm: null,
          sets: [{ weightKg: 120, reps: 1 }],
        },
      ],
    });

    const entries = await getLastEntriesByExercise(db.handle, userId, [press.id]);
    expect(entries.get(press.id)?.sets).toEqual([{ weightKg: 70, reps: 8 }]);
  });
});
