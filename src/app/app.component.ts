import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { AlertService } from './shared/services/alert.service';
import { AlertConfig } from './shared/components/custom-alert/custom-alert.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'powerguardian-web';

  alertConfig: AlertConfig = { message: '' };
  alertVisible = false;
  private alertSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.alertSubscription = this.alertService.alert$.subscribe(alert => {
      if (alert) {
        this.alertConfig = alert.config;
        this.alertVisible = alert.visible;
      } else {
        this.alertVisible = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
