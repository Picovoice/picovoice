import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'picovoice-web-angular-demo-picovoice';
  show = true

  toggle() {
    this.show = !this.show
  }
}
