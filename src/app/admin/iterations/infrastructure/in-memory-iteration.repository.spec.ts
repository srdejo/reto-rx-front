import { TestBed } from '@angular/core/testing';
import { InMemoryIterationRepository } from './in-memory-iteration.repository';

describe('InMemoryIterationRepository', () => {
  let repo: InMemoryIterationRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(InMemoryIterationRepository);
  });

  it('generates and finds an invite token by role', () => {
    const [it] = repo.list()();
    const token = repo.generateToken(it.id, 'participant');
    const found = repo.findByToken(token);
    expect(found?.role).toBe('participant');
    expect(found?.iteration.id).toBe(it.id);
  });
});
