import { Injectable, inject } from '@angular/core';
import { Ref } from '@core/domain/models/shared.types';
import { BootcampRepository } from '@core/domain/ports/bootcamp.repository';
import { CapacityRepository } from '@core/domain/ports/capacity.repository';

export interface BootcampDeletePlan {
  name: string;
  capDel: Ref[];
  capKeep: Ref[];
  techDel: Ref[];
  techKeep: Ref[];
  keepList: Ref[];
}

/**
 * Computes what a bootcamp delete would leave "orphaned" — capacities and
 * technologies only used by this bootcamp — purely for the confirmation
 * preview. Nothing besides the bootcamp itself is actually deleted.
 */
@Injectable({ providedIn: 'root' })
export class GetBootcampDeletePlanUseCase {
  private readonly bootcampRepository = inject(BootcampRepository);
  private readonly capacityRepository = inject(CapacityRepository);

  async execute(bootcampId: number): Promise<BootcampDeletePlan | null> {
    const [bootcamps, capacities] = await Promise.all([
      this.bootcampRepository.getAll(),
      this.capacityRepository.getAll()
    ]);
    const b = bootcamps.find((x) => x.id === bootcampId);
    if (!b) return null;

    const fullCap = (id: number) => capacities.find((c) => c.id === id) ?? { technologies: [] as Ref[] };
    const others = bootcamps.filter((x) => x.id !== bootcampId);
    const shared = (c: Ref) => others.some((o) => o.capacities.some((oc) => oc.id === c.id));
    const capDel = b.capacities.filter((c) => !shared(c));
    const capKeep = b.capacities.filter(shared);

    const delIds = new Set(capDel.map((c) => c.id));
    const remaining = capacities.filter((c) => !delIds.has(c.id));
    const uniqTechs = [...new Map(capDel.flatMap((c) => fullCap(c.id).technologies).map((t) => [t.id, t])).values()];
    const techDel = uniqTechs.filter((t) => !remaining.some((c) => c.technologies.some((x) => x.id === t.id)));
    const techKeep = uniqTechs.filter((t) => !techDel.includes(t));

    return { name: b.name, capDel, capKeep, techDel, techKeep, keepList: [...capKeep, ...techKeep] };
  }
}
