var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides } from 'ionic-angular';
/**
 * Generated class for the StartPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var StartPage = /** @class */ (function () {
    function StartPage(navCtrl, _zone) {
        this.navCtrl = navCtrl;
        this._zone = _zone;
    }
    StartPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad StartPage');
    };
    StartPage.prototype.redirect = function () {
        // this will redirect to login page when tap to continue button of slider. 
        this.navCtrl.push("OptionPage");
    };
    StartPage.prototype.slideNext = function ($index) {
        console.log($index);
        this.slides.slideNext();
        console.log("slide CHANGED", this.slides.getActiveIndex());
        var a = this.slides.getActiveIndex();
        if (a == 3) {
            this.redirect();
        }
    };
    __decorate([
        ViewChild(Slides),
        __metadata("design:type", Slides)
    ], StartPage.prototype, "slides", void 0);
    StartPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-start',
            template: "\n   <ion-content class=\"tutorial-page\">\n   <button ion-button small outline class=\"skip\" icon-right (click)=\"redirect()\">\n        Skip\n    </button> \n   <ion-slides pager>\n        <ion-slide class=\"slider\">\n             \n            <img src=\"assets/image/first1.png\" class=\"slide-image\"/>\n      \n        </ion-slide>\n        <ion-slide class=\"slider\">\n            <img src=\"assets/image/second2.png\" class=\"slide-image\"/>\n     \n        </ion-slide>\n        <ion-slide class=\"slider\">\n            <img src=\"assets/image/third3.png\" class=\"slide-image1\"/>\n          \n        </ion-slide>\n        <ion-slide class=\"slider\" style=\"display:none;\">\n            <img src=\"assets/image/third3.png\" class=\"slide-image1\"/>\n          \n        </ion-slide>\n    </ion-slides>\n    <button ion-button small outline class=\"next\" icon-right (click)=\"slideNext($index)\">\n            Next\n    </button>\n</ion-content>\n    ",
        }),
        __metadata("design:paramtypes", [NavController, NgZone])
    ], StartPage);
    return StartPage;
}());
export { StartPage };
//# sourceMappingURL=start.js.map