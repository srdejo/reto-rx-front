import { TestBed } from '@angular/core/testing';
import { IterationEnrollmentStore } from './iteration-enrollment.store';

describe('IterationEnrollmentStore', () => {
  let store: IterationEnrollmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(IterationEnrollmentStore);
  });

  it('rejects enrolling twice in the same bootcamp', () => {
    const [first] = store.enrollments();
    const err = store.enroll(first.bootcampId, () => '', 'Someone', first.email, '2000-01-01');
    expect(err).toBe('Ya estás inscrito en este bootcamp.');
  });

  it('caps active enrollments at 5 per email', () => {
    const email = 'max@mail.com';
    for (let i = 1; i <= 5; i++) {
      const err = store.enroll(100 + i, () => '', 'Max', email, '2000-01-01');
      expect(err).toBeNull();
    }
    const err = store.enroll(200, () => '', 'Max', email, '2000-01-01');
    expect(err).toBe('Ya estás inscrito en 5 bootcamps, el máximo permitido.');
  });

  it('generates and finds an invite token by role', () => {
    const [it] = store.iterations();
    const token = store.generateToken(it.id, 'participant');
    const found = store.findByToken(token);
    expect(found?.role).toBe('participant');
    expect(found?.iteration.id).toBe(it.id);
  });
});
