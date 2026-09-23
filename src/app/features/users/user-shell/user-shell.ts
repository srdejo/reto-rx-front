import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { GetAllBootcampsUseCase } from '@core/application/use-cases/get-all-bootcamps.use-case';
import { GetAllCapacitiesUseCase } from '@core/application/use-cases/get-all-capacities.use-case';
import { GetTechnologiesUseCase } from '@core/application/use-cases/get-technologies.use-case';
import { AuthService } from '@core/application/use-cases/auth.service';
import { Toast } from '@shared/components/toast/toast';

@Component({
  selector: 'app-user-shell',
  imports: [RouterLink, RouterOutlet, Toast],
  templateUrl: './user-shell.html',
  styleUrl: './user-shell.css'
})
export class UserShell {
  private readonly authService = inject(AuthService);

  constructor() {
    inject(GetTechnologiesUseCase).execute();
    inject(GetAllCapacitiesUseCase).execute();
    inject(GetAllBootcampsUseCase).execute();
  }

  logout(): void {
    this.authService.logout();
  }
}
