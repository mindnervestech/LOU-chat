var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { global } from '../global/global';
import { Network } from '@ionic-native/network';
import { PushProvider } from '../../providers/push/push';
import { LoadingProvider } from '../../providers/loading/loading';
import { CommonProvider } from '../../providers/common/common';
import * as Message from '../../providers/message/message';
var NewrequestPage = /** @class */ (function () {
    function NewrequestPage(CommonProvider, LoadingProvider, toastCtrl, network, _zone, PushProvider, navCtrl, navParams, alertCtrl, actsheetCtrl) {
        this.CommonProvider = CommonProvider;
        this.LoadingProvider = LoadingProvider;
        this.toastCtrl = toastCtrl;
        this.network = network;
        this._zone = _zone;
        this.PushProvider = PushProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.actsheetCtrl = actsheetCtrl;
        this.hide = false;
        this.usersList = new Array();
        var user = firebase.auth().currentUser;
        var me = this;
        if (!user) {
            me.navCtrl.setRoot("LoginPage");
        }
    }
    NewrequestPage.prototype.ionViewDidLoad = function () {
        /* when user comes to this view this function will load. here is the show all PendingRequest for currentUser. it will show all the request till user accept or reject.
        the data will load from firebase pending request table. */
        var user = firebase.auth().currentUser;
        var me = this;
        //off() function all callbacks for the reference will be removed.
        firebase.database().ref('PendingRequest/' + user.uid).off();
        firebase.database().ref('PendingRequest/' + user.uid).on('value', function (snapshot) {
            me.LoadingProvider.startLoading();
            me.usersList = [];
            var fa = snapshot.exists(); // true
            if (fa == true) {
                snapshot.forEach(function (snapshot) {
                    me.hide = false;
                    me.msg = "";
                    var request = snapshot.val();
                    var usersRef = firebase.database().ref('users');
                    usersRef.child(request.SenderId).once('value', function (snap) {
                        var convertDate = request.DateCreated.split(" ");
                        var dateValue = convertDate[0].split("-");
                        var timeValue = convertDate[1].split(":");
                        var lastDate = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
                        var time = me.CommonProvider.formatAMPM(lastDate);
                        var users = snap.val();
                        me._zone.run(function () {
                            var userinfo = {
                                profilePic: users ? ((users.profilePic == "") ? 'assets/image/profile.png' : users.profilePic) : 'assets/image/profile.png',
                                name: users.name,
                                email: users.email,
                                date: lastDate.toLocaleDateString() + " " + time,
                                senderId: request.SenderId,
                                userId: user.uid,
                                key: snapshot.key
                            };
                            me.usersList.push(userinfo);
                        });
                    });
                });
            }
            else {
                me.hide = true;
                me.msg = "There is no new request for you";
            }
            me.LoadingProvider.closeLoading();
        });
    };
    NewrequestPage.prototype.reject = function (item) {
        /* this function will call when user slide to list and tap reject button. this is used for rejecting their request to individual requester.if
           user tap to reject it will delete from firebase PendingRequest table and also remove from the pending request view. */
        var me = this;
        if (me.network.type == "none") {
            var toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        var userId = firebase.auth().currentUser.uid;
        var userEmail = firebase.auth().currentUser.email;
        var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
        firebase.database().ref('PendingRequest/' + userId + "/" + item.key).remove().then(function () {
            var alert = me.alertCtrl.create({
                title: 'Rejected',
                subTitle: Message.FRIEND_REQUEST_REJECT_SUCCESS + item.email,
                buttons: ['OK']
            });
            alert.present();
            // send notification
            var title = "Reject Request";
            var body = Message.PUSH_REJECT_REQUEST + senderName;
            me.PushProvider.PushNotification(item.RegId, title, body);
        });
    };
    NewrequestPage.prototype.accept = function (item) {
        /* this function will call when user slide to list and tap accept button. this is used for accepting their request to individual requester.if
           user tap to accept it will delete from firebase PendingRequest table and also add to friend table and remove from the pending request view. */
        var me = this;
        if (me.network.type == "none") {
            var toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        var date = new Date();
        var userId = firebase.auth().currentUser.uid;
        var userEmail = firebase.auth().currentUser.email;
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
        firebase.database().ref('Friends/' + userId).once('value').then(function (snapshot) {
            var a = 0; // true
            snapshot.forEach(function (snapshot) {
                if (snapshot.val().SenderId == item.senderId) {
                    a = 1;
                }
            });
            if (a == 0) {
                firebase.database().ref().child('Friends/' + userId + '/' + item.senderId).set({
                    DateCreated: dateCreated,
                    SenderId: item.senderId,
                    unreadCount: 0,
                    lastDate: dateCreated,
                    lastMessage: "",
                    block: 0
                }).then(function (snapshot) {
                    firebase.database().ref().child('Friends/' + item.senderId + '/' + userId).set({
                        DateCreated: dateCreated,
                        SenderId: userId,
                        unreadCount: 0,
                        lastDate: dateCreated,
                        lastMessage: "",
                        block: 0
                    }).then(function () {
                        firebase.database().ref('PendingRequest/' + userId + "/" + item.key).remove().then(function () {
                            var alert = me.alertCtrl.create({
                                title: 'Accepted',
                                subTitle: Message.FRIEND_REQUEST_ACCEPT_SUCCESS + item.email,
                                buttons: ['OK']
                            });
                            alert.present();
                            // send notification
                            var title = "Accept Request";
                            var body = "your have been connected with  " + senderName;
                            me.PushProvider.PushNotification(item.RegId, title, body);
                            //me.PushNotification(userId, item.RegId, true);
                        });
                    });
                });
            }
            else {
                var alert_1 = me.alertCtrl.create({
                    title: 'Already Friends',
                    subTitle: Message.ALREADY_FRIENDS + item.email,
                    buttons: ['OK']
                });
                alert_1.present();
            }
        });
    };
    NewrequestPage.prototype.presentAllowDeny = function (s) {
        var _this = this;
        if (this.network.type == "none") {
            var toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        var actionSheet = this.actsheetCtrl.create({
            title: 'Friend Request',
            buttons: [
                {
                    text: 'Accept',
                    handler: function () {
                        _this.accept(s);
                    }
                },
                {
                    text: 'Reject',
                    handler: function () {
                        _this.reject(s);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: function () {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    };
    NewrequestPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-newrequest',
            template: "\n    <ion-header>\n        <ion-navbar>\n            <button ion-button menuToggle>\n                <ion-icon name='menu'></ion-icon>\n            </button>\n            <ion-title  class=\"title\">Pending Request</ion-title>\n        </ion-navbar>\n    </ion-header>\n\n    <ion-content class=\"newrequest-page-content\">\n        <div *ngIf=\"hide\">\n            <h4 style=\"color:#ccc\" padding text-center>{{msg}}</h4>\n        </div>\n\n        <ion-list [virtualScroll]=\"usersList\" [approxItemHeight]=\"'70px'\" >\n            <ion-item-sliding *virtualItem=\"let item\">\n                <ion-item (click)=\"presentAllowDeny(item)\" tappable>\n                    <ion-avatar item-left>\n                        <ion-img class=\"imgstyle\" src='{{item.profilePic}}' ></ion-img>\n                    </ion-avatar>\n                    <h2 *ngIf=\"item.name\">{{ item.name }}</h2>\n                    <h2 *ngIf=\"!item.name\">{{ item.email }}</h2>\n                    <p>{{ item.date}}</p>                  \n                </ion-item>\n                         \n                <ion-item-options side='right'>\n                    <button ion-button color='secondary' small (click)='accept(item)' tappable>\n                        Allow\n                    </button>\n                    <button ion-button color='danger' small (click)='reject(item)' tappable>\n                        Deny\n                    </button>\n                </ion-item-options>\n            </ion-item-sliding>\n\n        </ion-list>\n    </ion-content>\n    ",
        }),
        __metadata("design:paramtypes", [CommonProvider, LoadingProvider, ToastController, Network, NgZone, PushProvider, NavController, NavParams, AlertController, ActionSheetController])
    ], NewrequestPage);
    return NewrequestPage;
}());
export { NewrequestPage };
//# sourceMappingURL=newrequest-page.js.map