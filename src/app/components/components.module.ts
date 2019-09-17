import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { ResizableModule } from 'angular-resizable-element';

@NgModule({
    declarations: [
        HomeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        CoreModule,
        ResizableModule,
    ]
})
export class ComponentsModule { }
