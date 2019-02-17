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
import { HttpModule } from '@angular/http';
import { CloudSettings, CloudModule } from "@ionic/cloud-angular";
import { Network } from '@ionic-native/network';
import { PushProvider } from '../providers/push/push';
import { CommonProvider } from '../providers/common/common';
import { LoadingProvider } from '../providers/loading/loading';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Firebase } from '@ionic-native/firebase/ngx';
//import { Firebase } from '@ionic-native/firebase/ngx';

const cloudSettings: CloudSettings = {
 'core': {
   'app_id': '41a30df7'
 }
};
@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
     CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot()
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
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    PushProvider,
    CommonProvider,
    LoadingProvider,
    GooglePlus,
    Facebook,
    Firebase,
  ]
})
export class AppModule { }
