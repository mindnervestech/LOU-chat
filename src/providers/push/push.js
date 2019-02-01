var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Headers, Http, RequestOptions } from '@angular/http';
/*
  Generated class for the PushProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
var PushProvider = /** @class */ (function () {
    function PushProvider(http) {
        this.http = http;
        console.log('Hello PushProvider Provider');
    }
    PushProvider.prototype.PushNotification = function (RegId, title, body) {
        //AuthorizationKey is declared globally on index.html and access here to send PushNotification.
        var me = this;
        var token = RegId;
        var data;
        data = {
            "notification": {
                "title": title,
                "body": body
            },
            "to": token
        };
        data = JSON.stringify(data);
        //var me = this;
        var headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'key=' + AuthorizationKey });
        var options = new RequestOptions({ headers: headers });
        me.http.post('https://fcm.googleapis.com/fcm/send', data, options)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            //  alert(JSON.stringify(res));
        }, function (err) {
            //  alert(err);
        });
    };
    PushProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], PushProvider);
    return PushProvider;
}());
export { PushProvider };
//# sourceMappingURL=push.js.map