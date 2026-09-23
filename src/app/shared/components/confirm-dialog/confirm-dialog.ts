import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('');
  readonly confirmLabel = input('Eliminar');
  /** While true the buttons are disabled and the dialog cannot be dismissed. */
  readonly loading = input(false);
  readonly loadingLabel = input('Eliminando…');
  readonly cancel = output<void>();
  readonly confirm = output<void>();

  requestCancel(): void {
    if (this.loading()) return;
    this.cancel.emit();
  }

  requestConfirm(): void {
    if (this.loading()) return;
    this.confirm.emit();
  }
}
