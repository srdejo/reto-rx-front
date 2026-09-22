import { TestBed } from '@angular/core/testing';
import { InMemoryEnrollmentRepository } from './in-memory-enrollment.repository';

describe('InMemoryEnrollmentRepository', () => {
  let repo: InMemoryEnrollmentRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(InMemoryEnrollmentRepository);
  });

  it('rejects enrolling twice in the same bootcamp', () => {
    const [first] = repo.list()();
    const err = repo.enroll(first.bootcampId, 'Someone', first.email, '2000-01-01');
    expect(err).toBe('Ya estás inscrito en este bootcamp.');
  });

  it('caps active enrollments at 5 per email', () => {
    const email = 'max@mail.com';
    for (let i = 1; i <= 5; i++) {
      const err = repo.enroll(100 + i, 'Max', email, '2000-01-01');
      expect(err).toBeNull();
    }
    const err = repo.enroll(200, 'Max', email, '2000-01-01');
    expect(err).toBe('Ya estás inscrito en 5 bootcamps, el máximo permitido.');
  });
});
