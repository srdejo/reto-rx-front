import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BootcampService } from '../../core/bootcamp.service';
import { CapacityService } from '../../core/capacity.service';
import { TechnologyService } from '../../core/technology.service';
import { Toast } from '../../shared/ui/toast/toast';

@Component({
  selector: 'app-user-shell',
  imports: [RouterLink, RouterOutlet, Toast],
  templateUrl: './user-shell.html',
  styleUrl: './user-shell.css'
})
export class UserShell implements OnInit {
  private readonly bootcampService = inject(BootcampService);
  private readonly capacityService = inject(CapacityService);
  private readonly technologyService = inject(TechnologyService);

  ngOnInit(): void {
    this.technologyService.load();
    this.capacityService.loadAll();
    this.bootcampService.loadAll();
  }
}
