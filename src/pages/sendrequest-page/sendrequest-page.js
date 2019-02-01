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
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { global } from '../global/global';
import { PushProvider } from '../../providers/push/push';
import { Network } from '@ionic-native/network';
import { LoadingProvider } from '../../providers/loading/loading';
import * as Message from '../../providers/message/message';
var SendrequestPage = /** @class */ (function () {
    function SendrequestPage(LoadingProvider, toastCtrl, network, http, PushProvider, navCtrl, navParams, alertCtrl) {
        this.LoadingProvider = LoadingProvider;
        this.toastCtrl = toastCtrl;
        this.network = network;
        this.http = http;
        this.PushProvider = PushProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        var user = firebase.auth().currentUser;
        var me = this;
        if (!user) {
            me.navCtrl.setRoot("LoginPage");
        }
        else {
            var current_user = firebase.auth().currentUser;
            me.currentUserId = current_user.uid;
        }
    }
    SendrequestPage.prototype.sendRequest = function () {
        var me = this;
        /* when user wants to send request to other by accessCode it will call.the user can send request
          to other by using their accessCode of other user share their accessCode to the currentUser */
        // in case of no internat connection, user can not send request to other.
        if (me.network.type == "none") {
            var toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        var AccessCode = me.accessCode.toLowerCase();
        var date = new Date();
        var check = 0;
        var f = 0;
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" +
            date.getSeconds();
        me.LoadingProvider.startLoading();
        firebase.database().ref().child('users').once('value').then(function (snapshot) {
            snapshot.forEach(function (snapshot) {
                me.LoadingProvider.closeLoading();
                var data = snapshot.val();
                if (data.access_code.toLowerCase() == AccessCode) {
                    var userId = snapshot.key;
                    var current_user = firebase.auth().currentUser;
                    var currentUserId = current_user.uid;
                    var senderName = (global.USER_NAME == "") ? current_user.email : global.USER_NAME;
                    //check if access code is sent to current logged in user
                    // if user send request by using his own accessCode this time user is unable to send request.
                    if (userId == currentUserId) {
                        var alert_1 = me.alertCtrl.create({
                            title: 'Request Not Sent',
                            subTitle: Message.REQUEST_YOURSELF,
                            buttons: ['OK']
                        });
                        alert_1.present();
                        f = 1;
                    }
                    /* if user send request to other by using accessCode it will check user is already friend of not, connected or not. if
                    connected then unable to send request. */
                    //check if they send request to user is already friends
                    if (f == 0) {
                        firebase.database().ref().child('Friends/' + userId + '/' + me.currentUserId).once('value').then(function (sn) {
                            var fa = sn.exists(); // true
                            if (fa == true) {
                                var alert_2 = me.alertCtrl.create({
                                    title: 'Already Friends',
                                    subTitle: Message.ALREADY_FRIENDS + data.email,
                                    buttons: ['OK']
                                });
                                alert_2.present();
                                f = 1;
                            }
                            //check if user have already send request to user before
                            /* if user send request to other by using accessCode it will check currentUser is already send request or not for that user,
                               the currentUser request is pending for that user. the currentUser request is still pending so he can not send request again to that user.
                               connected then unable to send request. */
                            if (f == 0) {
                                firebase.database().ref().child('PendingRequest/' + userId + '/' + me.currentUserId).once('value').then(function (snapshot) {
                                    var fa = snapshot.exists(); // true
                                    if (fa == true) {
                                        var alert_3 = me.alertCtrl.create({
                                            title: 'Request Already Sent',
                                            subTitle: Message.FRIEND_REQUEST_ALREADY_SENT + data.email,
                                            buttons: ['OK']
                                        });
                                        alert_3.present();
                                        f = 1;
                                    }
                                    /* if currentUser send request using accessCode of other user if both not yet connected or currentUser didn't send request before
                                       then user is able to send request */
                                    if (f != 1) {
                                        firebase.database().ref('PendingRequest/' + userId + '/' + me.currentUserId).set({
                                            DateCreated: dateCreated,
                                            SenderId: me.currentUserId
                                        }).then(function (snapshot) {
                                            me.accessCode = "";
                                            var alert = me.alertCtrl.create({
                                                title: 'Request Sent',
                                                subTitle: Message.FRIEND_REQUEST_SUCCESS + data.email,
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                            //send notification
                                            // me.PushNotification(data.pushToken, current_user.email);
                                            var title = "Request";
                                            var body = Message.PUSH_NEW_REQUEST + senderName;
                                            me.PushProvider.PushNotification(data.pushToken, title, body);
                                        }).catch(function (error) {
                                            me.accessCode = "";
                                            var alert = me.alertCtrl.create({
                                                title: 'Error',
                                                subTitle: error,
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                        });
                                    }
                                });
                            }
                        });
                    }
                    check = 1;
                }
            });
            // if AccessCode not match to the any user.
        }).then(function () {
            if (check == 0) {
                me.LoadingProvider.closeLoading();
                me.accessCode = "";
                var alert_4 = me.alertCtrl.create({
                    title: Message.ACCESS_Code_NOT_FOUND_TITLE,
                    subTitle: Message.ACCESS_Code_NOT_FOUND_SUBTITLE,
                    buttons: ['OK']
                });
                alert_4.present();
            }
        });
    };
    SendrequestPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-sendrequest',
            template: "\n    <ion-header>\n        <ion-navbar swipeBackEnabled=\"false\">\n            <button ion-button menuToggle>\n                <ion-icon name='menu'></ion-icon>\n            </button>\n            <ion-title class=\"title\">Send Request</ion-title>\n        </ion-navbar>\n    </ion-header>\n\n    <ion-content>\n        <ion-item class=\"item\">\n            <ion-input type=\"text\" placeholder=\"Access Code\" [(ngModel)]='accessCode' maxlength=\"6\"></ion-input>\n        </ion-item>\n        <br><br>\n        <span align='center'>\n            <div>\n                <button ion-button color='primary' (click)=\"sendRequest()\" class=\"btndesign\" tappable>\n                    Send Contact Request\n                </button>\n            </div>\n        </span>\n    </ion-content>\n    ",
        }),
        __metadata("design:paramtypes", [LoadingProvider, ToastController, Network, Http, PushProvider, NavController, NavParams, AlertController])
    ], SendrequestPage);
    return SendrequestPage;
}());
export { SendrequestPage };
//# sourceMappingURL=sendrequest-page.js.map