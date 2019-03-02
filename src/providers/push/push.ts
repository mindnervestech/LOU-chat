import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Headers, Http, RequestOptions } from '@angular/http';
declare var firebase;
declare var AuthorizationKey: any; // AuthorizationKey
/*
  Generated class for the PushProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PushProvider {

  constructor(public http: Http) {
    console.log('Hello PushProvider Provider');
  }
  PushNotification(RegId, title, body) {
    //AuthorizationKey is declared globally on index.html and access here to send PushNotification.
    var me = this;
    var token = RegId;
    var data: any;
    data = {
      "notification": {
        "title": title,
        "body": body,
        "sound": 'mySound'
      },

      "to": token
    }
    data = JSON.stringify(data);
    //var me = this;
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'key='+AuthorizationKey });
    let options = new RequestOptions({ headers: headers });
    me.http.post('https://fcm.googleapis.com/fcm/send', data, options)
      .map(res => res.json())
      .subscribe(res => {
        //  alert(JSON.stringify(res));
      }, (err) => {
      //  alert(err);
      });

  }
}
