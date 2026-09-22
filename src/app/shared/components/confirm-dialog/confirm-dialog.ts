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
  readonly cancel = output<void>();
  readonly confirm = output<void>();
}
