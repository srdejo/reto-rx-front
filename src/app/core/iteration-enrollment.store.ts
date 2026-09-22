import { Injectable, signal } from '@angular/core';
import { Enrollee, Enrollment, Iteration } from './models';
import { addDays } from './format.util';

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

function seedEnrollments(): Enrollment[] {
  const rows: [string, number][] = [
    ['Ana Torres', 3],
    ['Juan Pérez', 3],
    ['Sofía Ramírez', 3],
    ['Carlos Mejía', 3],
    ['Valentina Ruiz', 4],
    ['Diego Castaño', 5],
    ['Ana Torres', 5],
    ['Camila Ortiz', 4]
  ];
  return rows.map(([name, bootcampId]) => ({
    name,
    bootcampId,
    birthDate: '2000-01-01',
    email:
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(' ', '.') + '@mail.com'
  }));
}

@Injectable({ providedIn: 'root' })
export class IterationEnrollmentStore {
  readonly iterations = signal<Iteration[]>(seedIterations());
  readonly enrollments = signal<Enrollment[]>(seedEnrollments());

  seatsFor(it: Iteration): number {
    return it.maxQuota - it.participants.length;
  }

  bootcampEnd(releaseDate: string, durationDays: number): string {
    return addDays(releaseDate, durationDays);
  }

  enrolledIn(bootcampId: number): Enrollment[] {
    return this.enrollments().filter((e) => e.bootcampId === bootcampId);
  }

  iterationsFor(bootcampId: number): Iteration[] {
    return this.iterations().filter((i) => i.bootcampId === bootcampId);
  }

  removeByBootcamp(bootcampId: number): void {
    this.iterations.update((list) => list.filter((i) => i.bootcampId !== bootcampId));
    this.enrollments.update((list) => list.filter((e) => e.bootcampId !== bootcampId));
  }

  createIteration(data: {
    bootcampId: number;
    startDate: string;
    maxQuota: number;
    tutors: string[];
  }): void {
    this.iterations.update((list) => {
      const nextId = list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
      return [
        ...list,
        {
          id: nextId,
          bootcampId: data.bootcampId,
          startDate: data.startDate,
          maxQuota: data.maxQuota,
          tutors: data.tutors,
          participants: [],
          deliverables: 0,
          tutorToken: null,
          partToken: null
        }
      ];
    });
  }

  generateToken(iterationId: number, role: 'tutor' | 'participant'): string {
    const token = `${role === 'tutor' ? 't-' : 'p-'}${iterationId}-${Math.random().toString(36).slice(2, 7)}`;
    this.iterations.update((list) =>
      list.map((i) =>
        i.id === iterationId ? { ...i, [role === 'tutor' ? 'tutorToken' : 'partToken']: token } : i
      )
    );
    return token;
  }

  findByToken(token: string): { iteration: Iteration; role: 'tutor' | 'participant' } | null {
    const it = this.iterations().find((i) => i.tutorToken === token || i.partToken === token);
    if (!it) return null;
    return { iteration: it, role: it.tutorToken === token ? 'tutor' : 'participant' };
  }

  acceptInvite(iterationId: number, role: 'tutor' | 'participant', name: string, email: string): string | null {
    const it = this.iterations().find((i) => i.id === iterationId);
    if (!it) return 'Iteración no encontrada.';
    if (role === 'participant') {
      if (this.seatsFor(it) <= 0) return 'La iteración alcanzó su cupo máximo.';
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

  enroll(bootcampId: number, bootcampEnd: (id: number) => string, name: string, email: string, birthDate: string): string | null {
    const mine = this.enrollments().filter((e) => e.email.toLowerCase() === email.toLowerCase());
    if (mine.some((e) => e.bootcampId === bootcampId)) return 'Ya estás inscrito en este bootcamp.';
    if (mine.length >= 5) return 'Ya estás inscrito en 5 bootcamps, el máximo permitido.';
    this.enrollments.update((list) => [...list, { bootcampId, name, email, birthDate }]);
    return null;
  }

  activeCountForEmail(email: string): number {
    return this.enrollments().filter((e) => e.email.toLowerCase() === email.trim().toLowerCase()).length;
  }
}
