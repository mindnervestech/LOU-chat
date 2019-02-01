import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
  Generated class for the LoadingProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LoadingProvider {
  loading: any;
  constructor( public loadingCtrl: LoadingController) {
    console.log('Hello LoadingProvider Provider');
  }
    startLoading() {
       var me = this;
    me.loading = me.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Please wait...'
    });
    me.loading.present();
  }

  closeLoading() {
     var me = this;
    me.loading.dismiss();
  }

}
