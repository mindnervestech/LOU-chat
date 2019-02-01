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
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
//import { UUID } from 'angular2-uuid';
import { Camera } from '@ionic-native/camera';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { Clipboard } from '@ionic-native/clipboard';
import { CommonProvider } from '../../providers/common/common';
import * as Message from '../../providers/message/message';
var ProfilePage = /** @class */ (function () {
    function ProfilePage(CommonProvider, _zone, events, navCtrl, sqlite, navParams, alertCtrl, actionSheetCtrl, camera, clipboard) {
        this.CommonProvider = CommonProvider;
        this._zone = _zone;
        this.events = events;
        this.navCtrl = navCtrl;
        this.sqlite = sqlite;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.actionSheetCtrl = actionSheetCtrl;
        this.camera = camera;
        this.clipboard = clipboard;
        this.captureDataUrl = "assets/image/sea.jpg";
        var user = firebase.auth().currentUser;
        var me = this;
        if (!user) {
            this.navCtrl.setRoot("LoginPage");
        }
        me.userInfo = {
            user_id: "",
            user_name: "",
            user_gender: "",
            user_status: "",
            user_profilePic: "",
            user_accessCode: "",
        };
        this.sqlite.create({
            name: 'data.db',
            location: 'default'
        })
            .then(function (db) {
            me.sqlDb = db;
            //clear old data
            /*db.executeSql('DELETE from userProfile', {}).then(() => {
                //db.vacuum;
                alert('TABLE deleted');
            }, (err:any) => {
                alert('Unable to execute sql: '+ err);
            });*/
            me.loadUserDataFromSqlStorage();
        });
    }
    ProfilePage.prototype.ionViewDidLoad = function () {
        this.loadUserProfileData();
    };
    ProfilePage.prototype.loadUserDataFromSqlStorage = function () {
        var me = this;
        var userId = firebase.auth().currentUser.uid;
        me.sqlDb.executeSql('select * from userProfile where user_id = ?', [userId]).then(function (data) {
            if (data.rows.length > 0) {
                me._zone.run(function () {
                    me.userInfo = data.rows.item(0);
                });
            }
        }, function (err) {
            alert('Unable to find data in userProfile: ' + JSON.stringify(err));
        });
    };
    ProfilePage.prototype.loadUserProfileData = function () {
        // this function will load user profile data. from firebase and insert and update in SQLite.
        var me = this;
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref('users/' + userId).on('value', function (snapshot) {
            var name = snapshot.val() ? snapshot.val().name : "";
            var email = snapshot.val() ? snapshot.val().email : "";
            var status = snapshot.val() ? snapshot.val().status : "";
            var gender = snapshot.val() ? snapshot.val().gender : "";
            var access_code = snapshot.val() ? snapshot.val().access_code : "";
            var profilePic = (snapshot.val().profilePic == "") ? 'assets/image/profile.png' : snapshot.val().profilePic;
            me.sqlDb.executeSql('select * from userProfile where user_id = ?', [userId]).then(function (data) {
                if (data.rows.length > 0) {
                    if (data.rows.item(0).name != name || data.rows.item(0).status != status || data.rows.item(0).gender != gender || data.rows.item(0).profilePic != profilePic) {
                        me.CommonProvider.toDataUrl(profilePic, function (myBase64) {
                            me.sqlDb.executeSql("UPDATE userProfile SET user_id='" + userId + "',user_gender='" + gender + "',user_name='" + name + "',user_email='" + email + "',user_status='" + status + "',user_profilePic='" + myBase64 + "',user_accessCode='" + access_code + "' where user_id = '" + userId + "'", [])
                                .then(function () {
                                me.loadUserDataFromSqlStorage();
                            })
                                .catch(function (e) { return alert('Unable to update sql: ' + JSON.stringify(e)); });
                        });
                    }
                }
                else {
                    me.CommonProvider.toDataUrl(profilePic, function (myBase64) {
                        me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + gender + "','" + name + "','" + email + "','" + status + "','" + myBase64 + "','" + access_code + "')", [])
                            .then(function () {
                            me.loadUserDataFromSqlStorage();
                        })
                            .catch(function (e) { return alert('Unable to insert sql: ' + JSON.stringify(e)); });
                    });
                }
            }, function (err) {
                alert('Unable to select sql: ' + JSON.stringify(err));
            });
        });
    };
    ProfilePage.prototype.gallaryUpload = function () {
        // it will call when image upload from Gallery and profile image update in firebase. 
        var me = this;
        me.camera.getPicture({
            sourceType: me.camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: me.camera.DestinationType.DATA_URL,
            quality: 80,
            targetWidth: 500,
            targetHeight: 500,
            allowEdit: true,
            correctOrientation: true
        }).then(function (imageData) {
            // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            var uploadTask = firebase.storage().ref().child(me.CommonProvider.Guid() + ".png").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.userInfo.user_profilePic = downloadFlyerURL;
                var userId = firebase.auth().currentUser.uid;
                var usersRef = firebase.database().ref('users');
                var hopperRef = usersRef.child(userId);
                hopperRef.update({
                    "profilePic": downloadFlyerURL
                });
                global.USER_IMAGE = downloadFlyerURL;
                me.PublishEventUserUpdate();
            });
        }, function (err) {
            console.log(err);
        });
    };
    ProfilePage.prototype.presentActionSheet = function () {
        var _this = this;
        var actionSheet = this.actionSheetCtrl.create({
            title: 'Profile Picture',
            buttons: [
                {
                    text: 'Upload from Gallery',
                    handler: function () {
                        _this.gallaryUpload();
                    }
                },
                {
                    text: 'Capture from Camera',
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
    ProfilePage.prototype.cameraUpload = function () {
        var filename = Math.floor(Date.now() / 1000);
        var me = this;
        me.camera.getPicture({
            quality: 80,
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
            //this.captureDataUrl=this.base64Image;
            var uploadTask = firebase.storage().ref().child(filename + ".jpg").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.userInfo.user_profilePic = downloadFlyerURL;
                var userId = firebase.auth().currentUser.uid;
                var usersRef = firebase.database().ref('users');
                var hopperRef = usersRef.child(userId);
                hopperRef.update({
                    "profilePic": downloadFlyerURL
                });
                global.USER_IMAGE = downloadFlyerURL;
                me.PublishEventUserUpdate();
            });
        }, function (err) {
            console.log(err);
        });
    };
    ProfilePage.prototype.updateProfile = function () {
        var me = this;
        var user_name = me.userInfo.user_name.replace("'", "''");
        var user_gender = me.userInfo.user_gender;
        var user_status = me.userInfo.user_status.replace("'", "''");
        var userId = firebase.auth().currentUser.uid;
        var usersRef = firebase.database().ref('users');
        var hopperRef = usersRef.child(userId);
        hopperRef.update({
            "name": user_name,
            "status": user_status,
            "gender": user_gender,
        });
        global.USER_NAME = user_name;
        var alert = me.alertCtrl.create({ subTitle: Message.PROFILE_UPDATE_SUCCESS, buttons: ['OK'] });
        alert.present();
        me.PublishEventUserUpdate();
    };
    ProfilePage.prototype.PublishEventUserUpdate = function () {
        var me = this;
        me.events.publish("LOAD_USER_UPDATE", "");
    };
    ProfilePage.prototype.Copy = function () {
        var me = this;
        me.clipboard.copy(me.userInfo.user_accessCode);
        me.clipboard.paste().then(function (resolve) {
            alert(resolve);
        }, function (reject) {
            // alert('Error: ' + reject);
        });
    };
    ProfilePage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-profile',
            templateUrl: 'profile-page.html',
        }),
        __metadata("design:paramtypes", [CommonProvider, NgZone, Events, NavController, SQLite, NavParams, AlertController,
            ActionSheetController, Camera, Clipboard])
    ], ProfilePage);
    return ProfilePage;
}());
export { ProfilePage };
//# sourceMappingURL=profile-page.js.map