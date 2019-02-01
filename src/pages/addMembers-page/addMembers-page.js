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
import * as Message from '../../providers/message/message';
var AddMembersPage = /** @class */ (function () {
    function AddMembersPage(CommonProvider, network, menu, sqlite, _zone, navCtrl, navParams /*,private storage: Storage*/) {
        this.CommonProvider = CommonProvider;
        this.network = network;
        this.menu = menu;
        this.sqlite = sqlite;
        this._zone = _zone;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.usersList = new Array();
        this.hide = false;
        this.group_name = "";
        this.train_number = "";
        this.start_time = "";
        this.end_time = "";
        this.train_date = "";
        this.usersData = new Array();
        var me = this;
        me.menu.swipeEnable(true);
        var user = firebase.auth().currentUser;
        if (!user) {
            me.navCtrl.setRoot("LoginPage");
        }
    }
    AddMembersPage.prototype.ionViewDidLoad = function () {
        console.log("ionViewDidLoad");
    };
    AddMembersPage.prototype.ionViewDidEnter = function () {
        console.log("ionViewDidEnter");
        //this.findMember();
    };
    AddMembersPage.prototype.goToFriendPage = function () {
        this.navCtrl.setRoot("FriendlistPage");
    };
    AddMembersPage.prototype.findMember = function () {
        var user = firebase.auth().currentUser;
        var me = this;
        firebase.database().ref('Friends/' + user.uid).off();
        firebase.database().ref('Friends/' + user.uid).on('value', function (snapshot) {
            var fa = snapshot.exists(); // true
            if (fa == true) {
                me.hide = false;
                snapshot.forEach(function (snapshot) {
                    var request = snapshot.val();
                    var usersRef = firebase.database().ref('users');
                    usersRef.child(request.SenderId).once('value', function (snap) {
                        var users = snap.val();
                        var profilePic = users ? ((users.profilePic == "") ? 'assets/image/profile.png' : users.profilePic) : 'assets/image/profile.png';
                        var userinfo = {
                            name: users.name,
                            profilePic: profilePic,
                            email: users.email,
                            senderId: request.SenderId,
                            userId: user.uid,
                            key: snapshot.key,
                            block: parseInt(request.block),
                            RegId: users.pushToken,
                            access_code: users.access_code
                        };
                        me.usersList.push(userinfo);
                    });
                });
            }
            else {
                me.hide = true;
                me.msg = Message.NOFRIEND_MSG;
            }
        });
        firebase.database().ref('users/' + user.uid).once('value', function (snap) {
            var data = snap.val();
            me.usersData.push(data);
            console.log("data", data);
        });
    };
    AddMembersPage.prototype.createGroup = function () {
        var _this = this;
        var user = firebase.auth().currentUser;
        console.log("usersData", this.usersData);
        var group_id = this.CommonProvider.createGroupId();
        var date = new Date();
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(dateCreated);
        firebase.database().ref().child('Group/').push({
            DateCreated: dateCreated,
            groupId: group_id,
            groupName: this.group_name,
            trainNumber: this.train_number,
            startTime: this.start_time,
            endTime: this.end_time,
            trainDate: this.train_date
        }).then(function () {
            /*console.log("add member");
            firebase.database().ref().child('GroupMember/'+ group_id + '/' + user.uid).set({
              groupId : group_id,
              DateCreated: dateCreated,
              userId : this.usersData[0].access_code,
              lastDate : dateCreated,
              unreadCount : 0,
              lastMessage: ''
            });
            for (var i = 0 ; i < this.usersList.length; i++) {
                   console.log(this.usersList);
                   firebase.database().ref().child('GroupMember/'+ group_id + '/' + this.usersList[i].key).set({
                        groupId : group_id,
                        DateCreated: dateCreated,
                        userId : this.usersList[i].access_code,
                        lastDate : dateCreated,
                        unreadCount : 0,
                        lastMessage: ''
                    });
            }*/
            _this.goToFriendPage();
        });
    };
    AddMembersPage = __decorate([
        IonicPage(),
        Component({
            selector: 'AddMembersPage',
            template: "\n    <ion-header>\n        <ion-navbar>\n            <button ion-button icon-only class=\"back-btn\" (click)=\"goToFriendPage()\">\n                <ion-icon name='arrow-back'></ion-icon>\n            </button>\n            <ion-title  class=\"title\">Add Members</ion-title>\n        </ion-navbar>\n    </ion-header>\n     <ion-content>\n     <div>\n         <ion-input type=\"text\" name=\"group_name\" placeholder=\"Enter group name\" [(ngModel)]=\"group_name\"></ion-input>\n     </div>\n     <div>\n         <ion-input type=\"text\" name=\"train_number\" placeholder=\"Enter train number name\" [(ngModel)]=\"train_number\"></ion-input>\n     </div>\n     <div>\n         <ion-input type=\"text\" name=\"start_time\" placeholder=\"Enter train start time\" [(ngModel)]=\"start_time\"></ion-input>\n     </div>\n     <div>\n         <ion-input type=\"text\" name=\"end_time\" placeholder=\"Enter train end time\" [(ngModel)]=\"end_time\"></ion-input>\n     </div>\n     <div>\n         <ion-input type=\"text\" name=\"date\" placeholder=\"Enter train start date\" [(ngModel)]=\"train_date\"></ion-input>\n     </div>\n        <!-- <div>\n            <ion-list [virtualScroll]=\"usersList\" [approxItemHeight]=\"'70px'\" >\n            <ion-item *virtualItem=\"let item\" (click)='messageBox($event,item)' tappable>\n                <ion-avatar item-left>\n                    <ion-img class=\"imgstyle\" src='{{item.profilePic}}' ></ion-img>\n                </ion-avatar>                \n                <h2 *ngIf=\"item.name\" >{{ item.name }} </h2>\n                <h2 *ngIf=\"!item.name\">{{ item.email }} </h2>             \n            </ion-item>          \n        </ion-list>      \n        </div> -->\n        <div>\n            <button ion-button icon-only (click)=\"createGroup()\">\n                Create Group\n            </button>\n        </div>\n    </ion-content>\n    ",
        }),
        __metadata("design:paramtypes", [CommonProvider, Network, MenuController, SQLite, NgZone, NavController, NavParams /*,private storage: Storage*/])
    ], AddMembersPage);
    return AddMembersPage;
}());
export { AddMembersPage };
//# sourceMappingURL=addMembers-page.js.map