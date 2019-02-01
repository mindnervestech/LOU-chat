var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagePopupPage } from './image-popup';
var ImagePopupPageModule = /** @class */ (function () {
    function ImagePopupPageModule() {
    }
    ImagePopupPageModule = __decorate([
        NgModule({
            declarations: [
                ImagePopupPage,
            ],
            imports: [
                IonicPageModule.forChild(ImagePopupPage),
            ],
            exports: [
                ImagePopupPage
            ]
        })
    ], ImagePopupPageModule);
    return ImagePopupPageModule;
}());
export { ImagePopupPageModule };
//# sourceMappingURL=image-popup.module.js.map