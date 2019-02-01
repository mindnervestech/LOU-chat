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
import { IonicPage, NavController, NavParams, AlertController, ToastController, MenuController, ActionSheetController } from 'ionic-angular';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
//import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { CommonProvider } from '../../providers/common/common';
import { LoadingProvider } from '../../providers/loading/loading';
import { Camera } from '@ionic-native/camera';
var loginAndTopicInfo = /** @class */ (function () {
    function loginAndTopicInfo(LoadingProvider, CommonProvider, network, toastCtrl, menu, _zone, events, alertCtrl, navCtrl, navParams, actionSheetCtrl, camera) {
        this.LoadingProvider = LoadingProvider;
        this.CommonProvider = CommonProvider;
        this.network = network;
        this.toastCtrl = toastCtrl;
        this.menu = menu;
        this._zone = _zone;
        this.events = events;
        this.alertCtrl = alertCtrl;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.actionSheetCtrl = actionSheetCtrl;
        this.camera = camera;
        this.nickName = "";
        this.userProfilePic = "";
        localStorage.setItem("isFirstTimeLoginTrue", "true");
        this.menu.swipeEnable(false);
    }
    loginAndTopicInfo.prototype.ionViewDidEnter = function () {
        var user = JSON.parse(localStorage.getItem("loginUser"));
        if (!user) {
            this.userProfilePic = "./assets/image/profile.png";
        }
        else {
            console.log("user", user);
            this.nickName = user.name;
            this.userProfilePic = (user.profilePic != '') ? user.profilePic : "./assets/image/profile.png";
            console.log(this.userProfilePic);
        }
        this.navParams.data;
        console.log(this.navParams.data);
        var me = this;
        var trainData = this.navParams.data;
        console.log(trainData.optionValue);
        firebase.database().ref('Group').orderByChild("trainNumber").equalTo(trainData.optionValue).on('value', function (group) {
            console.log(group.val());
            var groupKey = Object.keys(group.val())[0];
            firebase.database().ref('Group/' + groupKey).on("value", function (GroupInformation) {
                console.log(GroupInformation.val());
                var groupData = {
                    key: groupKey,
                    unreadCount: GroupInformation.val().unreadCount,
                    lastMessage: GroupInformation.val().lastMessage,
                    groupId: GroupInformation.val().groupId,
                    groupName: GroupInformation.val().groupName,
                    tripeDate: GroupInformation.val().tripeDate,
                    startTime: GroupInformation.val().startTime,
                    endTime: GroupInformation.val().endTime,
                };
                me.groupInfo = groupData;
                localStorage.setItem("Group", JSON.stringify(groupData));
            });
        });
    };
    loginAndTopicInfo.prototype.GoToFriendListPage = function () {
        this.navCtrl.push("FriendlistPage");
    };
    loginAndTopicInfo.prototype.LoginUser = function () {
        var _this = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        if (!user) {
            this.newLoginUser();
        }
        else {
            //user data update and add member to group
            console.log("user", user);
            this.LoadingProvider.startLoading();
            var group_id = this.groupInfo.groupId;
            var date = new Date();
            var key = localStorage.getItem("userId");
            var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            firebase.database().ref().child('GroupMember/' + group_id + '/' + key).set({
                groupId: group_id,
                DateCreated: dateCreated,
                userId: user.access_code,
                lastDate: dateCreated,
                unreadCount: this.groupInfo.unreadCount,
                lastMessage: this.groupInfo.lastMessage
            });
            var phofilePic = "";
            if (this.base64Image != undefined) {
                phofilePic = this.base64Image;
            }
            firebase.database().ref().child('users/' + key).update({
                "phofilePic": phofilePic,
                "tripe": {
                    "business": this.navParams.data.selectedOption1,
                    "Tourism": this.navParams.data.selectedOption2,
                    "visitPeople": this.navParams.data.selectedOption3,
                    "HomeWork": this.navParams.data.selectedOption4,
                }
            }).then(function () {
                _this.LoadingProvider.closeLoading();
                _this.navCtrl.setRoot("FriendlistPage");
            });
        }
    };
    loginAndTopicInfo.prototype.newLoginUser = function () {
        var me = this;
        localStorage.setItem("value", "true");
        if (me.nickName != "") {
            me.LoadingProvider.startLoading();
            console.log("nickName", me.nickName);
            firebase.database().ref('users').orderByChild("name").equalTo(me.nickName).on('value', function (user) {
                console.log("user", user.val());
                if (user.val() == null) {
                    localStorage.setItem("value", "false");
                    console.log(me.base64Image);
                    var phofilePic = "";
                    if (me.base64Image != undefined) {
                        phofilePic = me.base64Image;
                    }
                    var profilePhoto = (me.base64Image == undefined) ? 'assets/image/profile.png' : me.base64Image;
                    var access_code = me.CommonProvider.randomString();
                    firebase.database().ref().child('users').push({
                        created: new Date().getTime(),
                        name: me.nickName,
                        access_code: access_code,
                        profilePic: phofilePic,
                        status: "",
                        gender: "",
                        email: "",
                        pushToken: "123456",
                        tripe: {
                            business: me.navParams.data.selectedOption1,
                            Tourism: me.navParams.data.selectedOption2,
                            visitPeople: me.navParams.data.selectedOption3,
                            HomeWork: me.navParams.data.selectedOption4,
                        }
                    }).then(function () {
                        console.log("in");
                        setTimeout(function () {
                            firebase.database().ref('users').orderByChild("name").equalTo(me.nickName).on('value', function (userInfo) {
                                var key = Object.keys(userInfo.val())[0];
                                console.log(userInfo.val());
                                global.USER_IMAGE = profilePhoto;
                                global.USER_NAME = me.nickName;
                                global.USER_ACCESS_CODE = access_code;
                                me.events.publish("LOAD_USER_UPDATE", "");
                                localStorage.setItem("IsLogin", 'true');
                                localStorage.setItem("userId", key);
                                var logInUser = {
                                    name: me.nickName,
                                    access_code: access_code,
                                    profilePic: phofilePic,
                                    uid: key
                                };
                                localStorage.setItem("loginUser", JSON.stringify(logInUser));
                                var group_id = me.groupInfo.groupId;
                                var date = new Date();
                                var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                                firebase.database().ref().child('GroupMember/' + group_id + '/' + key).set({
                                    groupId: group_id,
                                    DateCreated: dateCreated,
                                    userId: access_code,
                                    lastDate: dateCreated,
                                    unreadCount: me.groupInfo.unreadCount,
                                    lastMessage: me.groupInfo.lastMessage
                                });
                                me.LoadingProvider.closeLoading();
                                me.navCtrl.setRoot("FriendlistPage");
                            });
                        }, 1500);
                    });
                }
                else {
                    if (localStorage.getItem("value") == "true") {
                        me.LoadingProvider.closeLoading();
                        var alert_1 = me.alertCtrl.create({ subTitle: "This name is all ready use please try another name", buttons: ['OK'] });
                        alert_1.present();
                        me.nickName = "";
                    }
                }
            });
        }
        else {
            var alert_2 = me.alertCtrl.create({ subTitle: "Please enter nick name", buttons: ['OK'] });
            alert_2.present();
        }
    };
    loginAndTopicInfo.prototype.presentActionSheet = function () {
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
    loginAndTopicInfo.prototype.gallaryUpload = function () {
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
                /* me.events.publish("LOAD_USER_UPDATE", "");
                 me._zone.run(() => {
                     me.sqlite.create({
                         name: 'data.db',
                         location: 'default'
                     })
                         .then((db: SQLiteObject) => {
                             me.sqlDb = db;
                             me.toDataUrl(downloadFlyerURL, function (myBase64) {
                                 me.sqlDb.executeSql("UPDATE userProfile SET user_profilePic='" + myBase64 + "' where user_id = '" + userId + "'", [])
                                     .then(() => {
     
                                     })
                                     .catch(e => alert('Unable to update sql: ' + JSON.stringify(e)));
                             });
                         });
                 });*/
            });
        }, function (err) {
            console.log(err);
        });
    };
    loginAndTopicInfo.prototype.cameraUpload = function () {
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
                /*  me.events.publish("LOAD_USER_UPDATE", "");
                  me._zone.run(() => {
                      me.sqlite.create({
                          name: 'data.db',
                          location: 'default'
                      })
                          .then((db: SQLiteObject) => {
                              me.sqlDb = db;
                              me.toDataUrl(downloadFlyerURL, function (myBase64) {
                                  me.sqlDb.executeSql("UPDATE userProfile SET user_profilePic='" + myBase64 + "' where user_id = '" + userId + "'", [])
                                      .then(() => {
  
                                      })
                                      .catch(e => alert('Unable to update sql: ' + JSON.stringify(e)));
                              });
                          });
                  });
  */
            });
        }, function (err) {
            console.log(err);
        });
    };
    loginAndTopicInfo = __decorate([
        IonicPage(),
        Component({
            selector: 'loginAndTopicInfo',
            templateUrl: 'loginAndTopicInfo.html',
        }),
        __metadata("design:paramtypes", [LoadingProvider,
            CommonProvider,
            Network,
            ToastController,
            MenuController,
            NgZone,
            Events,
            AlertController,
            NavController,
            NavParams,
            ActionSheetController,
            Camera])
    ], loginAndTopicInfo);
    return loginAndTopicInfo;
}());
export { loginAndTopicInfo };
//# sourceMappingURL=loginAndTopicInfo.js.map