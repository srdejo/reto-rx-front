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
  readonly close = output<void>();
  readonly submit = output<void>();

  onBackdropClick(): void {
    this.close.emit();
  }
}
