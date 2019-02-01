import { NgModule } from '@angular/core';
import { PagesWelcomeComponent } from './pages-welcome/pages-welcome';
import { WelcomeComponent } from './welcome/welcome';
import { OptionComponent } from './option/option';
import { PagesComponent } from './pages/pages';
@NgModule({
	declarations: [PagesWelcomeComponent,
    WelcomeComponent,
    OptionComponent,
    PagesComponent],
	imports: [],
	exports: [PagesWelcomeComponent,
    WelcomeComponent,
    OptionComponent,
    PagesComponent]
})
export class ComponentsModule {}
