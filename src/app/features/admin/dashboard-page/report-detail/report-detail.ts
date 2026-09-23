import { Component, computed, input } from '@angular/core';
import { BootcampReport } from '@core/domain/models/report.model';
import { addDays, fmt } from '@shared/utils/format.util';

/** Full report of one bootcamp: info, capacities with their technologies and enrolled persons. */
@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.css'
})
export class ReportDetail {
  readonly report = input.required<BootcampReport>();

  protected readonly view = computed(() => {
    const r = this.report();
    return {
      name: r.name,
      description: r.description || 'Sin descripción',
      range: `${fmt(r.releaseDate)} → ${fmt(addDays(r.releaseDate, r.durationDays))}`,
      duration: `${r.durationDays} días`,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString('es-CO') : '—',
      stats: [
        { label: 'Capacidades', value: r.capacityCount },
        { label: 'Tecnologías', value: r.technologyCount },
        { label: 'Inscritos', value: r.enrolledCount }
      ],
      caps: r.capacities,
      people: [...r.enrolledPersons].sort((a, b) => a.name.localeCompare(b.name))
    };
  });
}
