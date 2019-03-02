import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StartPage } from './start';
import { HttpModule,Http} from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
//import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import 'rxjs';
import { TranslateService } from '@ngx-translate/core';
export function setTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    StartPage,
  ],
  imports: [
    IonicPageModule.forChild(StartPage),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (setTranslateLoader),
        deps: [Http]
      }
    })
  ],
  exports: [
    StartPage
  ]
})
export class StartPageModule {}
