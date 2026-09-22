import { Injectable, Signal, signal } from '@angular/core';
import { Enrollment } from '../domain/enrollment.model';
import { EnrollmentRepository } from '../domain/enrollment.repository';

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

const MAX_ACTIVE_BOOTCAMPS = 5;

@Injectable({ providedIn: 'root' })
export class InMemoryEnrollmentRepository extends EnrollmentRepository {
  private readonly enrollments = signal<Enrollment[]>(seedEnrollments());

  override list(): Signal<Enrollment[]> {
    return this.enrollments;
  }

  override enrolledIn(bootcampId: number): Enrollment[] {
    return this.enrollments().filter((e) => e.bootcampId === bootcampId);
  }

  override removeByBootcamp(bootcampId: number): void {
    this.enrollments.update((list) => list.filter((e) => e.bootcampId !== bootcampId));
  }

  override activeCountForEmail(email: string): number {
    return this.enrollments().filter((e) => e.email.toLowerCase() === email.trim().toLowerCase()).length;
  }

  override enroll(bootcampId: number, name: string, email: string, birthDate: string): string | null {
    const mine = this.enrollments().filter((e) => e.email.toLowerCase() === email.toLowerCase());
    if (mine.some((e) => e.bootcampId === bootcampId)) return 'Ya estás inscrito en este bootcamp.';
    if (mine.length >= MAX_ACTIVE_BOOTCAMPS) return `Ya estás inscrito en ${MAX_ACTIVE_BOOTCAMPS} bootcamps, el máximo permitido.`;
    this.enrollments.update((list) => [...list, { bootcampId, name, email, birthDate }]);
    return null;
  }
}
