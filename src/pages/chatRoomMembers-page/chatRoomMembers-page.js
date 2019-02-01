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
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
var ChatRoomMembers = /** @class */ (function () {
    function ChatRoomMembers(CommonProvider, network, menu, sqlite, _zone, navCtrl, navParams /*,private storage: Storage*/) {
        this.CommonProvider = CommonProvider;
        this.network = network;
        this.menu = menu;
        this.sqlite = sqlite;
        this._zone = _zone;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.groupList = new Array();
        this.groupMemberKey = new Array();
        this.hide = false;
        this.count = 0;
        var me = this;
        me.menu.swipeEnable(true);
        var user = firebase.auth().currentUser;
        if (!user) {
            me.navCtrl.setRoot("LoginPage");
        }
    }
    ChatRoomMembers.prototype.ionViewDidLoad = function () {
        console.log("ionViewDidLoad");
        console.log(this.navParams.data);
        this.getChatMemberData(this.navParams.data);
    };
    ChatRoomMembers.prototype.ionViewDidEnter = function () {
        console.log("ionViewDidEnter");
    };
    ChatRoomMembers.prototype.goToFriendPage = function () {
        this.navCtrl.setRoot("FriendlistPage");
    };
    ChatRoomMembers.prototype.getChatMemberData = function (groupId) {
        var me = this;
        firebase.database().ref('GroupMember/' + groupId).on('value', function (snapshot) {
            var groupData = snapshot.val();
            for (var data in groupData) {
                console.log(data);
                me.groupMemberKey.push(data);
                console.log(me.groupMemberKey);
                firebase.database().ref('users/' + data).on('value', function (snap) {
                    var value = snap.val();
                    var profilePic = value ? ((value.profilePic == "") ? 'assets/image/profile.png' : value.profilePic) : 'assets/image/profile.png';
                    var groupDetail = {
                        name: value.name,
                        email: value.email,
                        access_code: value.access_code,
                        profilePic: profilePic,
                        status: value.status,
                        senderId: me.groupMemberKey[me.count],
                        block: 0,
                    };
                    me.groupList.push(groupDetail);
                    me.count++;
                    console.log("groupData", me.groupList);
                });
                setTimeout(function () {
                }, 500);
            }
        });
    };
    ChatRoomMembers.prototype.showProfile = function (item) {
        this.navCtrl.push("ShowProfilePage", item);
    };
    ChatRoomMembers = __decorate([
        IonicPage(),
        Component({
            selector: 'ChatRoomMembers',
            template: "\n    <ion-header>\n        <ion-navbar>\n            <button ion-button icon-only class=\"back-btn\" (click)=\"goToFriendPage()\">\n                <ion-icon name='arrow-back'></ion-icon>\n            </button>\n            <ion-title  class=\"title\">Chat Room Members</ion-title>\n        </ion-navbar>\n    </ion-header>\n    <ion-content>\n        <ion-list [virtualScroll]=\"groupList\" [approxItemHeight]=\"'70px'\" >\n            <ion-item *virtualItem=\"let item\" (click)='showProfile(item)' tappable>\n                <ion-avatar item-left>\n                    <ion-img class=\"imgstyle\" src='{{item.profilePic}}' ></ion-img>\n                </ion-avatar>                \n                <h2 *ngIf=\"item.name\" >{{ item.name }} </h2>\n                <h2 *ngIf=\"!item.name\">{{ item.email }} </h2>\n                <p>{{ item.status }} </p>            \n            </ion-item>          \n        </ion-list>\n    </ion-content>\n    ",
        }),
        __metadata("design:paramtypes", [CommonProvider, Network, MenuController, SQLite, NgZone, NavController, NavParams /*,private storage: Storage*/])
    ], ChatRoomMembers);
    return ChatRoomMembers;
}());
export { ChatRoomMembers };
//# sourceMappingURL=chatRoomMembers-page.js.map