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
import { Content, IonicPage, NavController, NavParams, MenuController, ToastController, ActionSheetController, Platform, ModalController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';
import { LoadingProvider } from '../../providers/loading/loading';
import { global } from '../global/global';
var GroupChatPage = /** @class */ (function () {
    function GroupChatPage(modalCtrl, camera, LoadingProvider, platform, actionSheetCtrl, toastCtrl, CommonProvider, network, menu, sqlite, _zone, navCtrl, navParams /*,private storage: Storage*/) {
        this.modalCtrl = modalCtrl;
        this.camera = camera;
        this.LoadingProvider = LoadingProvider;
        this.platform = platform;
        this.actionSheetCtrl = actionSheetCtrl;
        this.toastCtrl = toastCtrl;
        this.CommonProvider = CommonProvider;
        this.network = network;
        this.menu = menu;
        this.sqlite = sqlite;
        this._zone = _zone;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.usersList = new Array();
        this.groupData = {};
        this.messagesList = [];
        this.hide = false;
        this.message = "";
        this.blockUser = 0;
        this.limit = 10;
        this.loadingmessageCounter = 0;
        var me = this;
        me.menu.swipeEnable(true);
        var user = firebase.auth().currentUser;
        if (!user) {
            me.navCtrl.setRoot("LoginPage");
        }
    }
    GroupChatPage.prototype.ionViewDidLoad = function () {
        console.log("ionViewDidLoad");
        var me = this;
        var userId = firebase.auth().currentUser.uid;
        me.myuserid = userId;
        me.findChatData();
        me.setScroll();
        firebase.database().ref().child('users/' + userId).on('value', function (user) {
            me.usersData = user.val();
            console.log("me.usersData", me.usersData);
        });
        firebase.database().ref().child('GroupChats/' + me.groupData.groupId).limitToLast(me.limit).off("child_added");
        firebase.database().ref().child('GroupChats/' + me.groupData.groupId).limitToLast(me.limit).on("child_added", function (messages) {
            //me.lastKeyProcess = true;
            console.log("group chat data", messages.val());
            me.loadingmessageCounter++;
            var convertDate = messages.val().DateCreated.split(" ");
            var dateValue = convertDate[0].split("-");
            var timeValue = convertDate[1].split(":");
            var date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
            var time = me.CommonProvider.formatAMPM(date);
            //me.ChatKeys.push(messages.key);
            me._zone.run(function () { return me.messagesList.push({
                'DateCreated': date.toLocaleDateString(),
                'time': time,
                'message': messages.val().message,
                'sender_id': messages.val().sender_id,
                'mkey': messages.key,
                "userId": me.myuserid,
                "type": messages.val().type,
                "profilePic": messages.val().profilePic,
            }); });
            console.log("msg list", me.messagesList);
            if (me.loadingmessageCounter > 5) {
                setTimeout(function () {
                    me.setScroll();
                }, 500);
            }
        });
    };
    GroupChatPage.prototype.ionViewDidEnter = function () {
        console.log("ionViewDidEnter");
        console.log(this.groupData.groupName);
        if (this.groupData.groupName != undefined) {
            var userId = firebase.auth().currentUser.uid;
            firebase.database().ref('GroupMember/' + this.groupData.groupId + '/' + userId).update({
                unreadCount: 0
            });
        }
    };
    GroupChatPage.prototype.goToFriendPage = function () {
        this.navCtrl.setRoot("FriendlistPage");
    };
    GroupChatPage.prototype.findChatData = function () {
        this.groupData = this.navParams.data;
        console.log(this.groupData);
    };
    GroupChatPage.prototype.goToChatRoomMember = function () {
        this.navCtrl.setRoot("ChatRoomMembers", this.groupData.groupId);
    };
    GroupChatPage.prototype.setScroll = function () {
        if (this.content._scroll)
            this.content.scrollToBottom(280);
    };
    GroupChatPage.prototype.inputClick = function () {
        var me = this;
        var dimensions = me.content.getContentDimensions();
        if (dimensions.scrollHeight - (dimensions.scrollTop + dimensions.contentHeight) <= 300) {
            me.content.scrollTo(0, dimensions.scrollHeight);
        }
    };
    GroupChatPage.prototype.showHeader = function (record, recordIndex) {
        var records = this.messagesList;
        var date1, date2;
        if (recordIndex != 0) {
            date1 = record.DateCreated;
            date2 = records[recordIndex - 1].DateCreated;
        }
        if (recordIndex === 0 || date1 != date2) {
            return true;
        }
        return false;
    };
    GroupChatPage.prototype.presentActionSheet = function () {
        console.log("attachment");
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
        else {
            var actionSheet = me.actionSheetCtrl.create({
                title: 'Sending Image Options',
                cssClass: 'action-sheets-basic-page',
                buttons: [
                    {
                        text: 'Camera',
                        icon: !me.platform.is('ios') ? 'camera' : null,
                        handler: function () {
                            me.cameraUpload();
                        }
                    },
                    {
                        text: 'Gallery',
                        icon: !me.platform.is('ios') ? 'image' : null,
                        handler: function () {
                            me.gallaryUpload();
                        }
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        icon: !me.platform.is('ios') ? 'close' : null,
                        handler: function () {
                            console.log('Cancel clicked');
                        }
                    }
                ]
            });
            actionSheet.present();
        }
    };
    GroupChatPage.prototype.sendMessage = function (type) {
        console.log("msg", type);
        var date = new Date();
        //in case of network type none means no internet connection then user can not send message to other.
        if (this.network.type == "none") {
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
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
        console.log("userId", userId);
        console.log("userEmail", userEmail);
        console.log("dateCreated", dateCreated);
        console.log("senderName", senderName);
        if (this.message != "") {
            var lastDisplaymessage = this.message.replace(/\r?\n/g, '<br />');
            this.message = "";
            var ta = document.getElementById('contentMessage');
            ta.style.overflow = "hidden";
            ta.style.height = "auto";
            ta.style.height = "45px";
            var me = this;
            firebase.database().ref().child('GroupChats/' + me.groupData.groupId).push({
                DateCreated: dateCreated,
                message: lastDisplaymessage,
                sender_id: userId,
                type: type,
                profilePic: me.usersData.profilePic
            }).then(function () {
                if (type == "text") {
                    firebase.database().ref('GroupMember/' + me.groupData.groupId).once('value').then(function (snapshot) {
                        var value = snapshot.val();
                        for (var i in value) {
                            var friendData = firebase.database().ref('GroupMember/' + me.groupData.groupId);
                            console.log(parseInt(value[i].unreadCount));
                            friendData.child(i).update({
                                unreadCount: parseInt(value[i].unreadCount) + 1,
                                lastDate: dateCreated,
                                lastMessage: lastDisplaymessage
                            });
                        }
                    });
                    firebase.database().ref('GroupMember/' + me.groupData.groupId + '/' + userId).once('value').then(function (snapshot) {
                        var friendRef = firebase.database().ref('GroupMember/' + me.groupData.groupId);
                        friendRef.child(userId).update({
                            unreadCount: 0,
                            lastDate: dateCreated,
                            lastMessage: lastDisplaymessage
                        });
                    });
                }
            });
        }
    };
    GroupChatPage.prototype.cameraUpload = function () {
        var filename = Math.floor(Date.now() / 1000);
        var me = this;
        me.camera.getPicture({
            quality: 90,
            destinationType: me.camera.DestinationType.DATA_URL,
            encodingType: me.camera.EncodingType.JPEG,
            mediaType: me.camera.MediaType.PICTURE,
            targetWidth: 320,
            targetHeight: 320,
            allowEdit: true,
            correctOrientation: true,
        }).then(function (imageData) {
            me.LoadingProvider.startLoading();
            var uploadTask = firebase.storage().ref().child(filename + ".jpg").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.message = downloadFlyerURL;
                me.sendMessage("image");
                setTimeout(function () {
                    me.LoadingProvider.closeLoading();
                }, 200);
            });
        }, function (err) {
            console.log(err);
        });
    };
    GroupChatPage.prototype.gallaryUpload = function () {
        var filename = Math.floor(Date.now() / 1000);
        var me = this;
        me.camera.getPicture({
            sourceType: me.camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: me.camera.DestinationType.DATA_URL,
            quality: 90,
            encodingType: me.camera.EncodingType.JPEG,
            targetWidth: 320,
            targetHeight: 320,
            allowEdit: true,
            correctOrientation: true,
        }).then(function (imageData) {
            var uploadTask = firebase.storage().ref().child(filename + ".jpg").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                me.LoadingProvider.startLoading();
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.message = downloadFlyerURL;
                me.sendMessage("image");
                setTimeout(function () {
                    me.LoadingProvider.closeLoading();
                }, 200);
            });
        }, function (err) {
            console.log(err);
        });
    };
    GroupChatPage.prototype.imageTap = function (src) {
        var modal = this.modalCtrl.create("ImagePopupPage", { imageSrc: src });
        modal.present();
    };
    GroupChatPage.prototype.showProfile = function (user) {
        console.log(user);
        var userData = {
            senderId: user.sender_id
        };
        this.navCtrl.push("ShowProfilePage", userData);
    };
    __decorate([
        ViewChild(Content),
        __metadata("design:type", Content)
    ], GroupChatPage.prototype, "content", void 0);
    GroupChatPage = __decorate([
        IonicPage(),
        Component({
            selector: 'AddMembersPage',
            template: "\n    <ion-header>\n        <ion-navbar>\n            <button ion-button icon-only class=\"back-btn\" (click)=\"goToFriendPage()\">\n                <ion-icon name='arrow-back'></ion-icon>\n            </button>\n            <ion-title  class=\"title\">{{groupData.groupName}}</ion-title>\n            <div>\n              <button ion-button icon-only class=\"btn\" (click)=\"goToChatRoomMember()\" tappable>\n                <ion-icon name=\"options\"></ion-icon>\n              </button>\n            </div>\n        </ion-navbar>\n    </ion-header>\n\n    <ion-content>\n    <div *ngIf=\"isBusy\" class=\"container\" [ngClass]=\"{'busy': isBusy}\">\n        <div class=\"backdrop\"></div>\n        <ion-spinner></ion-spinner>\n    </div>\n    <div>\n\n  <ion-list>\n     <ion-item-group *ngFor=\"let message of messagesList; let i = index;\">\n\n     <ion-item-divider  style=\"text-align: center;\" *ngIf=\"showHeader(message,i)\" >{{message.DateCreated}}</ion-item-divider>\n    <ion-item  class=\"chat-page-ion-item\">\n     <div  *ngIf=\"message.type == 'text'\" >\n            <ion-row *ngIf=\"message.sender_id == myuserid\" id=\"quote-{{message.mkey}}\">\n                <p class=\"the-message\" style=\"width:100%;\"><span class=\"myright\"><span  [innerHTML]=\"message.message\" ></span><br><span class=\"mtime\">{{ message.time}}</span></span>\n                </p>\n            </ion-row>\n            <ion-row *ngIf=\"message.sender_id != myuserid\" id=\"quote-{{message.mkey}}\">\n                <p class=\"the-message\" style=\"width:100%;\"><span class=\"myleft\"><span    [innerHTML]=\"message.message\"></span><br><span class=\"mtime\">{{ message.time}}</span></span>\n                </p>\n                <div>\n                  <ion-avatar item-left>\n                    <ion-img class=\"imgstyle\" src='{{(message.profilePic == \"\") ? \".assets/image/profile.png\" : \"message.profilePic\"}}' (click)=\"showProfile(message)\"></ion-img>\n                  </ion-avatar>\n                </div>\n            </ion-row>\n      </div>\n        <div  *ngIf=\"message.type == 'image'\" >\n            <ion-row *ngIf=\"message.sender_id == myuserid\" id=\"quote-{{message.mkey}}\">\n                <p class=\"the-message\" style=\"width:100%;\"><span class=\"myright-image\"><span > <img (click)=\"imageTap(message.message)\" style=\"opacity: 0.5;\" [src]=\"_DomSanitizer.bypassSecurityTrustUrl(message.message)\"/> </span><br><span class=\"mtime-image\">{{ message.time}}</span></span>\n                </p>\n            </ion-row>\n            <ion-row *ngIf=\"message.sender_id != myuserid\" id=\"quote-{{message.mkey}}\">\n                <p class=\"the-message\" style=\"width:100%;\"><span class=\"myleft-image\"><span>  <img style=\"opacity: 0.5;\"  (click)=\"imageTap(message.message)\" [src]=\"_DomSanitizer.bypassSecurityTrustUrl(message.message)\"/></span><br><span class=\"mtime-image\">{{ message.time}}</span></span>\n                </p>\n                <div>\n                  <ion-avatar item-left>\n                    <ion-img class=\"imgstyle\" src='{{(message.profilePic == \"\") ? \".assets/image/profile.png\" : \"message.profilePic\"}}' (click)=\"showProfile(message)\"></ion-img>\n                  </ion-avatar>\n                </div>\n            </ion-row>\n      </div>\n    </ion-item>\n    </ion-item-group>\n  </ion-list>\n    </div>\n</ion-content>\n\n<ion-footer>\n    <ion-toolbar *ngIf=\"blockUser\" class=\"blocked-message\">\n        <p text-center>{{ blockMsg }}</p>\n    </ion-toolbar>\n    <ion-toolbar *ngIf=\"!blockUser\">\n        <textarea contenteditable=\"true\" placeholder='Type your message here' [(ngModel)]=\"message\" (click)='inputClick()' class=\"editableContent\"\n            placeholder='Type your message here' id=\"contentMessage\"></textarea>\n\n        <ion-buttons end>\n     <button ion-button style=\"color:white;\" icon-right (click)='presentActionSheet()' tappable>\n                    <ion-icon name='attach'></ion-icon>\n                </button>\n            <button ion-button icon-right color='primary' tappable (click)='sendMessage(\"text\")' tappable>\n                    Send\n                    <ion-icon name='send'></ion-icon>\n                </button>\n        </ion-buttons>\n    </ion-toolbar>\n</ion-footer>\n    ",
        }),
        __metadata("design:paramtypes", [ModalController, Camera, LoadingProvider, Platform, ActionSheetController, ToastController, CommonProvider, Network, MenuController, SQLite, NgZone, NavController, NavParams /*,private storage: Storage*/])
    ], GroupChatPage);
    return GroupChatPage;
}());
export { GroupChatPage };
//# sourceMappingURL=groupChat-page.js.map