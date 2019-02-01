var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
var ShowProfilePage = /** @class */ (function () {
    function ShowProfilePage(network, events, navCtrl, navParams, alertCtrl, actionSheetCtrl, camera) {
        this.network = network;
        this.events = events;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.actionSheetCtrl = actionSheetCtrl;
        this.camera = camera;
        this.block = 1;
        this.captureDataUrl = "assets/image/sea.jpg";
        var user = firebase.auth().currentUser;
        var me = this;
        if (!user) {
            me.navCtrl.setRoot("LoginPage");
        }
        else {
            me.userInfo = {
                user_name: "",
                user_gender: "",
                user_status: "",
                user_profilePic: "",
                user_accessCode: "",
            };
            var userId = me.navParams.data.senderId;
            console.log(userId);
            var loginUserId = firebase.auth().currentUser.uid;
            if (me.navParams.data.senderId == loginUserId) {
                me.block = 0;
            }
            /* on chat page when user tap to view profile of connected user then this page will be load that data comes from firebase or SQLite.
            if network type is none then data load from SQLite */
            if (me.network.type == "none") {
                me.userInfo = {
                    user_gender: me.navParams.data.gender,
                    user_name: me.navParams.data.name,
                    user_email: me.navParams.data.email,
                    user_status: me.navParams.data.status,
                    user_profilePic: me.navParams.data.profilePic,
                    user_accessCode: me.navParams.data.access_code
                };
            } // call else if internet connection is available.the currentUser can view the profile of connected user.
            else {
                //data load from firebase.
                firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                    console.log('snapshotss', snapshot.val());
                    var name = snapshot.val() ? snapshot.val().name : "";
                    var email = snapshot.val() ? snapshot.val().email : "";
                    var status = snapshot.val() ? snapshot.val().status : "";
                    var gender = snapshot.val() ? snapshot.val().gender : "";
                    var access_code = snapshot.val() ? snapshot.val().access_code : "";
                    var profilePic = (snapshot.val().profilePic == "") ? 'assets/image/profile.png' : snapshot.val().profilePic;
                    me.userInfo = {
                        user_gender: gender,
                        user_name: name,
                        user_email: email,
                        user_status: status,
                        user_profilePic: profilePic,
                        user_accessCode: access_code
                    };
                });
            }
        }
    }
    ShowProfilePage.prototype.goToChatPage = function () {
        this.navCtrl.push("ChatPage", this.navParams.data);
    };
    ShowProfilePage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-show-profile',
            template: "\n    <ion-header>\n        <ion-navbar>\n            <button ion-button menuToggle>\n                <ion-icon name='menu'></ion-icon>\n            </button>\n            <ion-title  class=\"title\">Profile</ion-title>   \n        </ion-navbar>\n    </ion-header>\n\n    <ion-content>\n        <div class=\"profile-image-container\">\n        <ion-img  id=\"profile-image\" [src]=\"userInfo.user_profilePic\" *ngIf=\"this.captureDataUrl\" ></ion-img>\n      <!-- <img id=\"profile-image\" [src]=\"userInfo.user_profilePic\" *ngIf=\"this.captureDataUrl\" /> -->\n         </div>\n        <div padding>\n            <ion-list>\n                <ion-item>Access Code : <span class=\"secondary-color\">{{  userInfo.user_accessCode }}</span></ion-item>\n                <ion-item>Email : {{ userInfo.user_email }}</ion-item>\n                <ion-item>Name : {{ userInfo.user_name }}</ion-item>\n                <ion-item>Gender : {{ userInfo.user_gender }}</ion-item>\n                <ion-item>Status : {{ userInfo.user_status }}</ion-item>              \n            </ion-list>  \n        </div>\n    </ion-content>\n    <ion-footer>\n        <div *ngIf=\"block == 1\" class=\"chat-icon-div\">\n            <span class=\"chat-icon\" (click)=\"goToChatPage()\">Chat</span>\n        </div>\n    </ion-footer>\n    ",
        }),
        __metadata("design:paramtypes", [Network, Events, NavController, NavParams, AlertController,
            ActionSheetController, Camera])
    ], ShowProfilePage);
    return ShowProfilePage;
}());
export { ShowProfilePage };
//# sourceMappingURL=show-profile.js.map