import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.html',
  styleUrl: './drawer.css'
})
export class Drawer {
  readonly open = input(false);
  readonly title = input('');
  readonly showFooter = input(true);
  readonly submitLabel = input('Guardar');
  /** While true the footer buttons are disabled and the drawer cannot be closed. */
  readonly loading = input(false);
  readonly loadingLabel = input('Guardando…');
  readonly close = output<void>();
  readonly submit = output<void>();

  requestClose(): void {
    if (this.loading()) return;
    this.close.emit();
  }

  requestSubmit(): void {
    if (this.loading()) return;
    this.submit.emit();
  }
}
