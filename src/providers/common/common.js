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
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
/*
  Generated class for the CommonProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
var CommonProvider = /** @class */ (function () {
    function CommonProvider(http) {
        this.http = http;
    }
    CommonProvider.prototype.toDataUrl = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    };
    CommonProvider.prototype.Guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    CommonProvider.prototype.formatAMPM = function (date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    };
    CommonProvider.prototype.randomString = function () {
        // genrate random string of 6 words for access_code.
        var stringLength = 6;
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
        var randomString = '';
        for (var i = 0; i < stringLength; i += 1) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomString += chars.substring(rnum, rnum + 1);
        }
        return randomString;
    };
    CommonProvider.prototype.createGroupId = function () {
        var stringLength = 12;
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
        var randomString = '';
        for (var i = 0; i < stringLength; i += 1) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomString += chars.substring(rnum, rnum + 1);
        }
        return randomString;
    };
    CommonProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], CommonProvider);
    return CommonProvider;
}());
export { CommonProvider };
//# sourceMappingURL=common.js.map