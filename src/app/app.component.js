var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { global } from '../pages/global/global';
import { Events } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { Camera } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';
import { Push } from '@ionic-native/push';
import { SQLite } from '@ionic-native/sqlite';
import { Deploy } from "@ionic/cloud-angular";
import { Network } from '@ionic-native/network';
//import { DomSanitizer } from '@angular/platform-browser';
import { Facebook /*FacebookLoginResponse*/ } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
var MyApp = /** @class */ (function () {
    function MyApp(fb, googlePlus, /*public _DomSanitizer: DomSanitizer,*/ network, deploy, push, loadingCtrl, alertCtrl, _zone, events, platform, storage, statusBar, actionSheetCtrl, splashScreen, clipboard, camera, sqlite) {
        var _this = this;
        this.fb = fb;
        this.googlePlus = googlePlus;
        this.network = network;
        this.deploy = deploy;
        this.push = push;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
        this._zone = _zone;
        this.events = events;
        this.platform = platform;
        this.storage = storage;
        this.statusBar = statusBar;
        this.actionSheetCtrl = actionSheetCtrl;
        this.splashScreen = splashScreen;
        this.clipboard = clipboard;
        this.camera = camera;
        this.sqlite = sqlite;
        this.rootPage = (localStorage.getItem("isFirstTimeLoginTrue") == 'true') ? "OptionPage" : "WelcomePage";
        this.usernameInfo = {
            displayname: "",
            profilePic: "assets/image/profile.png",
            accessCode: ""
        };
        this.initializeApp();
        /***********/
        // used for an example of ngFor and navigation
        this.pages = [{ title: 'My Profile', component: "ProfilePage" },
            { title: 'Friend List', component: "FriendlistPage" },
            { title: 'Pending Requests', component: "NewrequestPage" },
            { title: 'Send Request', component: "SendrequestPage" }];
        this.events.subscribe("LOAD_USER_UPDATE", function (eventData) {
            _this.usernameInfo.displayname = global.USER_NAME;
            _this.usernameInfo.profilePic = (global.USER_IMAGE) ? global.USER_IMAGE : "assets/image/profile.png";
            _this.usernameInfo.accessCode = global.USER_ACCESS_CODE;
        });
        var me = this;
        this.storage.clear();
        me.storage.forEach(function (value, key, index) {
            me.storage.remove(key);
        });
    }
    MyApp.prototype.initializeApp = function () {
        var _this = this;
        localStorage.setItem('RegId', "123456");
        this.platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            _this.statusBar.styleDefault();
            _this.splashScreen.hide();
            //Send Notification
            //senderId is declared globally on index.html and access here to send PushNotification.
            var senderId;
            var options = {
                android: {
                    senderID: senderId
                },
                ios: {
                    alert: 'true',
                    badge: true,
                    sound: 'false'
                },
                windows: {}
            };
            var pushObject = _this.push.init(options);
            pushObject.on('notification').subscribe(function (notification) { return console.log('Received a notification', notification); });
            pushObject.on('registration').subscribe(function (registration) {
                localStorage.setItem('RegId', registration.registrationId);
            });
            pushObject.on('error').subscribe(function (error) { });
            // ionic Deploy, it is used to deploy project on ionic view no need to install apk again and again it will update directly.
            /*  this.deploy.check().then((snapshotAvailable: boolean) => {
  
                  if (snapshotAvailable) {
                      this.downloadAndInstall();
                  }
                 
              });
           */
            //create database and table sqlite
            _this.sqlite.create({
                name: 'data.db',
                location: 'default'
            })
                .then(function (db) {
                //create table friendslist for all friends data of logged in user
                db.executeSql('CREATE TABLE IF NOT EXISTS friendsList(id INTEGER PRIMARY KEY AUTOINCREMENT,name,profilePic text,email,date,lastDate,senderId,userId,key,unreadMessage INTEGER,lastMessage,block INTEGER,RegId,access_code,gender,status,profileImageUrl text)', {})
                    .then(function () { return console.log('Created Table friendsList'); })
                    .catch(function (e) { return alert(e); });
                //create table userprofile for user profile data
                db.executeSql('CREATE TABLE IF NOT EXISTS userProfile(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id,user_gender,user_name,user_email,user_status,user_profilePic text,user_accessCode)', {})
                    .then(function () { return console.log('Created Table userProfile'); })
                    .catch(function (e) { return alert(e); });
                //create table chat data
                db.executeSql('CREATE TABLE IF NOT EXISTS chat(id INTEGER PRIMARY KEY AUTOINCREMENT,DateCreated,time,isRead,message,sender_id,mkey,userId,recieverId,type)', {})
                    .then(function () { return console.log('Created Table userProfile'); })
                    .catch(function (e) { return alert(e); });
            });
        });
    };
    MyApp.prototype.downloadAndInstall = function () {
        var _this = this;
        var updating = this.loadingCtrl.create({
            content: 'Updating application.....'
        });
        updating.present();
        this.deploy.download().then(function () { return _this.deploy.extract(); }).then(function () { return _this.deploy.load(); });
    };
    MyApp.prototype.Copy = function () {
        this.clipboard.copy(this.usernameInfo.accessCode);
        this.clipboard.paste().then(function (resolve) {
            alert(resolve);
        }, function (reject) {
        });
    };
    MyApp.prototype.openPage = function (page) {
        this.nav.setRoot(page.component);
    };
    MyApp.prototype.logOutUser = function () {
        var me = this;
        if (this.network.type == "none") {
            //no internet connection
            localStorage.removeItem("option");
            localStorage.removeItem("GroupKey");
            localStorage.removeItem("GroupId");
            localStorage.removeItem("Group");
            me.nav.setRoot("OptionPage");
        }
        else {
            var GroupId = localStorage.getItem("GroupId");
            var userId = localStorage.getItem("userId");
            firebase.database().ref('GroupMember/' + GroupId + '/' + userId).remove();
            localStorage.removeItem("option");
            localStorage.removeItem("GroupKey");
            localStorage.removeItem("GroupId");
            localStorage.removeItem("Group");
            me.nav.setRoot("OptionPage");
        }
        /*var isGoogleLogin = localStorage.getItem('isGoogleLogin');
        var isFacebookLogin = localStorage.getItem('isFacebookLogin');
        if (this.network.type == "none") {
            //no internet connection
            localStorage.removeItem("userId");
            localStorage.removeItem("IsLogin");
            localStorage.setItem("isFirstTimeLoginTrue", "true");
            localStorage.removeItem("isGoogleLogin");
            localStorage.removeItem("isFacebookLogin");
            me.nav.setRoot("OptionPage");
        }
        else {
            me.startLoading();
            firebase.auth().signOut().then(function () {
                // Sign-out successful.
                me.closeLoading();
                me.storage.clear();
                me.storage.forEach((value, key, index) => {
                    me.storage.remove(key);
                });
                 //logout from google and  firebase if login from that

                 if (isGoogleLogin == "true") {
                     me.googlePlus.logout();
                 }
                 if (isFacebookLogin == "true") {
                     me.fb.logout();
                 }
                 
                me._zone.run(() => {
                    localStorage.removeItem("userId");
                    localStorage.removeItem("IsLogin");
                    localStorage.setItem("isFirstTimeLoginTrue", "true");
                    me.nav.setRoot("OptionPage");
                    localStorage.removeItem("isGoogleLogin");
                    localStorage.removeItem("isFacebookLogin");
                });
               
            }, function (error) {
                me.closeLoading();
                let alert = me.alertCtrl.create({ subTitle: "An Error is occured while logging out.", buttons: ['OK'] });
                alert.present();
            });
        }*/
    };
    MyApp.prototype.startLoading = function () {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        this.loading.present();
    };
    MyApp.prototype.closeLoading = function () {
        this.loading.dismiss();
    };
    MyApp.prototype.presentActionSheet = function () {
        var _this = this;
        var actionSheet = this.actionSheetCtrl.create({
            title: 'Profile Photo',
            buttons: [
                {
                    text: 'Upload Photo',
                    handler: function () {
                        _this.gallaryUpload();
                    }
                },
                {
                    text: 'Take Photo',
                    handler: function () {
                        _this.cameraUpload();
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
    MyApp.prototype.gallaryUpload = function () {
        var filename = Math.floor(Date.now() / 1000);
        var me = this;
        me.camera.getPicture({
            sourceType: me.camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: me.camera.DestinationType.DATA_URL,
            quality: 50,
            encodingType: me.camera.EncodingType.JPEG,
            targetWidth: 500,
            targetHeight: 500,
            allowEdit: true,
            correctOrientation: true
        }).then(function (imageData) {
            // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            var uploadTask = firebase.storage().ref().child(filename + ".jpg").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.usernameInfo.profilePic = downloadFlyerURL;
                var userId = firebase.auth().currentUser.uid;
                var usersRef = firebase.database().ref('users');
                var hopperRef = usersRef.child(userId);
                hopperRef.update({
                    "profilePic": downloadFlyerURL
                });
                global.USER_IMAGE = downloadFlyerURL;
                me.events.publish("LOAD_USER_UPDATE", "");
                me._zone.run(function () {
                    me.sqlite.create({
                        name: 'data.db',
                        location: 'default'
                    })
                        .then(function (db) {
                        me.sqlDb = db;
                        me.toDataUrl(downloadFlyerURL, function (myBase64) {
                            me.sqlDb.executeSql("UPDATE userProfile SET user_profilePic='" + myBase64 + "' where user_id = '" + userId + "'", [])
                                .then(function () {
                            })
                                .catch(function (e) { return alert('Unable to update sql: ' + JSON.stringify(e)); });
                        });
                    });
                });
            });
        }, function (err) {
            console.log(err);
        });
    };
    MyApp.prototype.toDataUrl = function (url, callback) {
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
    MyApp.prototype.cameraUpload = function () {
        var filename = Math.floor(Date.now() / 1000);
        var me = this;
        me.camera.getPicture({
            quality: 50,
            destinationType: me.camera.DestinationType.DATA_URL,
            encodingType: me.camera.EncodingType.JPEG,
            mediaType: me.camera.MediaType.PICTURE,
            targetWidth: 500,
            targetHeight: 500,
            allowEdit: true,
            correctOrientation: true
        }).then(function (imageData) {
            // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            var uploadTask = firebase.storage().ref().child(filename + ".jpg").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.usernameInfo.profilePic = downloadFlyerURL;
                var userId = firebase.auth().currentUser.uid;
                var usersRef = firebase.database().ref('users');
                var hopperRef = usersRef.child(userId);
                hopperRef.update({
                    "profilePic": downloadFlyerURL
                });
                global.USER_IMAGE = downloadFlyerURL;
                me.events.publish("LOAD_USER_UPDATE", "");
                me._zone.run(function () {
                    me.sqlite.create({
                        name: 'data.db',
                        location: 'default'
                    })
                        .then(function (db) {
                        me.sqlDb = db;
                        me.toDataUrl(downloadFlyerURL, function (myBase64) {
                            me.sqlDb.executeSql("UPDATE userProfile SET user_profilePic='" + myBase64 + "' where user_id = '" + userId + "'", [])
                                .then(function () {
                            })
                                .catch(function (e) { return alert('Unable to update sql: ' + JSON.stringify(e)); });
                        });
                    });
                });
            });
        }, function (err) {
            console.log(err);
        });
    };
    __decorate([
        ViewChild(Nav),
        __metadata("design:type", Nav)
    ], MyApp.prototype, "nav", void 0);
    MyApp = __decorate([
        Component({
            template: "\n    <ion-nav [root]='rootPage' #content swipeBackEnabled='false'></ion-nav>\n    <ion-menu [content]='content'>\n        <ion-header>\n            <ion-toolbar>\n                <span align=\"center\"><ion-title>MyChat</ion-title></span>\n            </ion-toolbar>\n        </ion-header>\n        <ion-content class=\"sidemenu-chat\">\n            <ion-list no-lines id=\"ProfileDP\">\n                <ion-item>\n                <div id=\"profileimage\"  [ngStyle]=\"{'background-image': 'url(' + usernameInfo.profilePic + ')'}\"                \n                 (click)=\"presentActionSheet()\" tappable>\n\n                </div>\n             <!--       <ion-avatar>\n                        <img class=\"circular--square\"  [src]=\"_DomSanitizer.bypassSecurityTrustUrl(usernameInfo.profilePic)\"  (click)=\"presentActionSheet()\">\n                    </ion-avatar> -->\n                </ion-item>\n                <h4 class=\"user-name\">{{usernameInfo.displayname}}</h4>\n                <h5 class=\"access-code\" (click)=\"Copy()\">Access Code : <span class=\"thecode\">{{usernameInfo.accessCode}}</span></h5>\n            </ion-list>\n\n            <ion-list>\n                <button menuClose ion-item *ngFor='let p of pages' (click)='openPage(p)'>\n                    {{p.title}}\n                </button>\n                <button menuClose ion-item (click)='logOutUser()'>\n                    Log Out\n                </button>\n            </ion-list>\n        </ion-content>\n    </ion-menu>\n    ",
            styles: ["\n\n    .sidemenu-chat .circular--square {\n        border-radius: 50%;\n        overflow: hidden;\n         margin-left: 30%;\n        margin-top: 5%;\n        margin-bottom: 2%;\n        height: 30vw;\n        width: 30vw;\n        box-shadow: 0 0 8px rgba(0, 0, 0, .8);\n        -webkit-box-shadow: 0 0 8px rgba(0, 0, 0, .8);\n        -moz-box-shadow: 0 0 8px rgba(0, 0, 0, .8);\n    }\n\n    .sidemenu-chat .user-name,.sidemenu-chat .access-code{\n        color:white;\n        text-align: center;\n    }\n    .sidemenu-chat .thecode{\n        color:#ffffff;\n        -webkit-user-select: text;\n        -moz-user-select: text;\n        -ms-user-select: text;\n        user-select: text;\n    }\n\n    .sidemenu-chat #ProfileDP\n    {\n        background:#20cbd4 !important;\n        padding-bottom:5px;\n        margin-bottom:0px;\n    }\n\n    .sidemenu-chat #ProfileDP .item-md\n    {\n        background:#20cbd4 !important;\n    }\n\n     .sidemenu-chat .label-md {\n        margin: 0px 0px 0px 0;\n     }\n     .sidemenu-chat .list-ios[no-lines] ion-list-header, .list-ios[no-lines] ion-item-options, .list-ios[no-lines] .item, .list-ios[no-lines] .item .item-inner {\n        background: #20cbd4 !important;\n    }\n    "]
        }),
        __metadata("design:paramtypes", [Facebook, GooglePlus, Network, Deploy, Push, LoadingController, AlertController, NgZone, Events, Platform, Storage, StatusBar, ActionSheetController, SplashScreen, Clipboard, Camera, SQLite])
    ], MyApp);
    return MyApp;
}());
export { MyApp };
//# sourceMappingURL=app.component.js.map