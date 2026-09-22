import { Injectable, Signal, signal } from '@angular/core';
import { CreateIterationInput, Enrollee, InviteRole, Iteration } from '@core/domain/models/iteration.model';
import { IterationRepository } from '@core/domain/ports/iteration.repository';

function seedIterations(): Iteration[] {
  const people = (n: number): Enrollee[] =>
    Array.from({ length: n }, (_, i) => ({ name: `Participante ${i + 1}`, email: `p${i + 1}@mail.com` }));
  return [
    {
      id: 1,
      bootcampId: 3,
      startDate: '2026-09-22',
      maxQuota: 30,
      tutors: ['laura.gomez@onclass.co', 'andres.rios@onclass.co'],
      participants: people(24),
      deliverables: 4,
      tutorToken: 'tp-t-8f3a',
      partToken: 'tp-p-2c91'
    },
    {
      id: 2,
      bootcampId: 4,
      startDate: '2026-11-03',
      maxQuota: 20,
      tutors: ['mateo.vargas@onclass.co'],
      participants: people(20),
      deliverables: 2,
      tutorToken: null,
      partToken: 'cn-p-77d0'
    },
    {
      id: 3,
      bootcampId: 3,
      startDate: '2027-02-01',
      maxQuota: 25,
      tutors: ['laura.gomez@onclass.co'],
      participants: [],
      deliverables: 0,
      tutorToken: null,
      partToken: null
    }
  ];
}

@Injectable({ providedIn: 'root' })
export class InMemoryIterationRepository extends IterationRepository {
  private readonly iterations = signal<Iteration[]>(seedIterations());

  override list(): Signal<Iteration[]> {
    return this.iterations;
  }

  override create(input: CreateIterationInput): Iteration {
    const created: Iteration = {
      id: this.iterations().reduce((m, x) => Math.max(m, x.id), 0) + 1,
      bootcampId: input.bootcampId,
      startDate: input.startDate,
      maxQuota: input.maxQuota,
      tutors: input.tutors,
      participants: [],
      deliverables: 0,
      tutorToken: null,
      partToken: null
    };
    this.iterations.update((list) => [...list, created]);
    return created;
  }

  override removeByBootcamp(bootcampId: number): void {
    this.iterations.update((list) => list.filter((i) => i.bootcampId !== bootcampId));
  }

  override generateToken(iterationId: number, role: InviteRole): string {
    const token = `${role === 'tutor' ? 't-' : 'p-'}${iterationId}-${Math.random().toString(36).slice(2, 7)}`;
    this.iterations.update((list) =>
      list.map((i) =>
        i.id === iterationId ? { ...i, [role === 'tutor' ? 'tutorToken' : 'partToken']: token } : i
      )
    );
    return token;
  }

  override findByToken(token: string): { iteration: Iteration; role: InviteRole } | null {
    const it = this.iterations().find((i) => i.tutorToken === token || i.partToken === token);
    if (!it) return null;
    return { iteration: it, role: it.tutorToken === token ? 'tutor' : 'participant' };
  }

  override acceptInvite(iterationId: number, role: InviteRole, name: string, email: string): string | null {
    const it = this.iterations().find((i) => i.id === iterationId);
    if (!it) return 'Iteración no encontrada.';
    if (role === 'participant') {
      const seats = it.maxQuota - it.participants.length;
      if (seats <= 0) return 'La iteración alcanzó su cupo máximo.';
      if (it.participants.some((p) => p.email === email)) return 'Este correo ya está inscrito.';
    }
    this.iterations.update((list) =>
      list.map((i) => {
        if (i.id !== iterationId) return i;
        if (role === 'tutor') {
          return { ...i, tutors: i.tutors.includes(email) ? i.tutors : [...i.tutors, email] };
        }
        return { ...i, participants: [...i.participants, { name, email }] };
      })
    );
    return null;
  }
}
