import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Camera } from '@ionic-native/camera';
import { Clipboard } from '@ionic-native/clipboard';
import { MyApp } from './app.component';
import { Push } from '@ionic-native/push';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite';
import { HttpModule,Http} from '@angular/http';
import { CloudSettings, CloudModule } from "@ionic/cloud-angular";
import { Network } from '@ionic-native/network';
import { PushProvider } from '../providers/push/push';
import { CommonProvider } from '../providers/common/common';
import { LoadingProvider } from '../providers/loading/loading';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Firebase } from '@ionic-native/firebase/ngx';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
//import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx'
//import { AdMob } from 'ionic-native';
//import { AdMob } from 'ionic-native';
export function setTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
//import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
//import { Firebase } from '@ionic-native/firebase/ngx';
//import { TranslateHttpLoader } from '@ngx-translate/http-loader';
//import {TranslateService} from '@ngx-translate/core';

const cloudSettings: CloudSettings = {
 'core': {
   'app_id': '41a30df7'
 }
};

// export function createTranslateLoader(http: Http) {
//   return new TranslateHttpLoader( http, './assets/i18n/', '.json');
// }
@NgModule({
  declarations: [
    MyApp,
    
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (setTranslateLoader),
        deps: [Http]
      }
    })
   // TranslateModule.forRoot()
  //  TranslateModule.forRoot({
  //   loader: {
  //       provide: TranslateLoader,
  //       useFactory: (createTranslateLoader),
  //       deps: [Http]
  //   }
//})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    Clipboard,
    SQLite,
    Push,
    Network,
    PushProvider,
    CommonProvider,
    LoadingProvider,
    GooglePlus,
    Facebook,
    Firebase,
    TranslateService,
    InAppBrowser,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
  ]
})
export class AppModule { }
