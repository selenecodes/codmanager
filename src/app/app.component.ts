import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(
        public electronService: ElectronService,
        private translate: TranslateService
    ) {
        this.translate.setDefaultLang('en');
        console.log('AppConfig', AppConfig);

        if (electronService.isElectron) {
            console.info('Mode electron');
        } else {
            console.info('Mode web');
        }
    }
}
