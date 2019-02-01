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
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { LoadingProvider } from '../../providers/loading/loading';
import * as Message from '../../providers/message/message';
import { CommonProvider } from '../../providers/common/common';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
var RegisterPage = /** @class */ (function () {
    function RegisterPage(fb, CommonProvider, googlePlus, LoadingProvider, sqlite, _zone, events, navCtrl, navParams, alertCtrl) {
        this.fb = fb;
        this.CommonProvider = CommonProvider;
        this.googlePlus = googlePlus;
        this.LoadingProvider = LoadingProvider;
        this.sqlite = sqlite;
        this._zone = _zone;
        this.events = events;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.user_email = "";
        this.user_password = "";
        this.user_conf_password = "";
        this.error_message = "";
    }
    RegisterPage.prototype.RegisterUser = function () {
        /* if user register their account to MyChat. it will create authentication in firbase for login.
           email and password will be username and password. */
        var me = this;
        if (me.user_email != "" && me.user_password != "" && me.user_conf_password != "") {
            if (me.user_password == me.user_conf_password) {
                me.LoadingProvider.startLoading();
                var access_code = me.CommonProvider.randomString();
                var Regid = localStorage.getItem('RegId');
                firebase.auth().createUserWithEmailAndPassword(me.user_email, me.user_password).then(function (user) {
                    firebase.database().ref().child('users/' + user.uid).set({
                        email: me.user_email,
                        access_code: access_code,
                        name: '',
                        gender: '',
                        status: '',
                        profilePic: '',
                        created: new Date().getTime(),
                        pushToken: Regid
                    }, function (error) {
                        if (error) {
                            me.LoadingProvider.closeLoading();
                            var alert_1 = me.alertCtrl.create({ subTitle: error, buttons: ['OK'] });
                            alert_1.present();
                        }
                        else {
                            var _currentUser_1 = firebase.auth().currentUser;
                            me.LoadingProvider.closeLoading();
                            if (_currentUser_1) {
                                console.log('_currentUser on register', _currentUser_1);
                                var userId = _currentUser_1.uid;
                                if (userId != "") {
                                    //register successfull then current user data will be load in app for global functionality.
                                    firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                                        console.log('userObject ', snapshot.val());
                                        var userObject = snapshot.val();
                                        var displayname = userObject ? userObject.name : "";
                                        var access_code = userObject.access_code;
                                        var profilePic = userObject ? ((userObject.profilePic == "") ? 'assets/image/profile.png' : userObject.profilePic) : 'assets/image/profile.png';
                                        global.USER_IMAGE = profilePic;
                                        global.USER_NAME = displayname;
                                        global.USER_ACCESS_CODE = access_code;
                                        me.events.publish("LOAD_USER_UPDATE", "");
                                        me._zone.run(function () {
                                            localStorage.setItem("IsLogin", 'true');
                                            localStorage.setItem("userId", userId);
                                            me.sqlite.create({
                                                name: 'data.db',
                                                location: 'default'
                                            })
                                                // data will also store in SQLite for ofline works.
                                                .then(function (db) {
                                                me.sqlDb = db;
                                                me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser_1.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                                                    .then(function () {
                                                    me.navCtrl.setRoot("FriendlistPage");
                                                })
                                                    .catch(function (e) { return alert('Unable to insert sql: ' + JSON.stringify(e)); });
                                            });
                                        });
                                    });
                                }
                            }
                            else {
                                console.log("User is logged out");
                            }
                        }
                    });
                }, function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/weak-password') {
                        me.LoadingProvider.closeLoading();
                        var alert_2 = me.alertCtrl.create({ subTitle: Message.PASSWORD_WEAK, buttons: ['OK'] });
                        alert_2.present();
                    }
                    else {
                        me.LoadingProvider.closeLoading();
                        var alert_3 = me.alertCtrl.create({ subTitle: errorMessage, buttons: ['OK'] });
                        alert_3.present();
                    }
                });
            }
            else {
                var alert_4 = me.alertCtrl.create({ subTitle: "Please enter same password both times !", buttons: ['OK'] });
                alert_4.present();
            }
        }
        else {
            var alert_5 = me.alertCtrl.create({ subTitle: Message.FIELD_REQUIRED, buttons: ['OK'] });
            alert_5.present();
        }
    };
    RegisterPage.prototype.GoogleLogin = function () {
        var me = this;
        me.googlePlus.login({
            'webClientId': '107282482959-tda07b8rbdpslvckrbtk1fessjbb1u15.apps.googleusercontent.com'
        }).then(function (res) {
            me.LoadingProvider.startLoading();
            localStorage.setItem("isGoogleLogin", "true");
            var firecreds = firebase.auth.GoogleAuthProvider.credential(res.idToken);
            firebase.auth().signInWithCredential(firecreds)
                .then(function (user) {
                //  alert("Google Firebase success: " + JSON.stringify(user));
                firebase.database().ref('users/' + user.uid).once('value').then(function (snapshot) {
                    if (snapshot.exists()) {
                        // user exits
                        var _currentUser_2 = firebase.auth().currentUser;
                        me.LoadingProvider.closeLoading();
                        if (_currentUser_2) {
                            console.log('_currentUser on register', _currentUser_2);
                            var userId = _currentUser_2.uid;
                            if (userId != "") {
                                //register successfull then current user data will be load in app for global functionality.
                                firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                                    console.log('userObject ', snapshot.val());
                                    var userObject = snapshot.val();
                                    var displayname = userObject ? userObject.name : "";
                                    var access_code = userObject.access_code;
                                    var profilePic = userObject ? ((userObject.profilePic == "") ? 'assets/image/profile.png' : userObject.profilePic) : 'assets/image/profile.png';
                                    global.USER_IMAGE = profilePic;
                                    global.USER_NAME = displayname;
                                    global.USER_ACCESS_CODE = access_code;
                                    me.events.publish("LOAD_USER_UPDATE", "");
                                    me._zone.run(function () {
                                        localStorage.setItem("IsLogin", 'true');
                                        localStorage.setItem("userId", userId);
                                        me.sqlite.create({
                                            name: 'data.db',
                                            location: 'default'
                                        })
                                            // data will also store in SQLite for ofline works.
                                            .then(function (db) {
                                            me.sqlDb = db;
                                            me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser_2.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                                                .then(function () {
                                                me.navCtrl.setRoot("FriendlistPage");
                                            })
                                                .catch(function (e) { return alert('Unable to insert sql: ' + JSON.stringify(e)); });
                                        });
                                    });
                                });
                            }
                        }
                        else {
                            console.log("User is logged out");
                        }
                    }
                    else {
                        me.LoginWithFirebaseSocialPlugin(user);
                    }
                });
            }).catch(function (err) {
                me.LoadingProvider.closeLoading();
                alert('Firebase auth failed' + err);
            });
        }).catch(function (err) { return JSON.stringify(err); });
    };
    RegisterPage.prototype.FacebookLogin = function () {
        var me = this;
        me.fb.login(['email']).then(function (response) {
            var facebookCredential = firebase.auth.FacebookAuthProvider
                .credential(response.authResponse.accessToken);
            me.LoadingProvider.startLoading();
            localStorage.setItem("isFacebookLogin", "true");
            firebase.auth().signInWithCredential(facebookCredential)
                .then(function (user) {
                //  alert("Firebase success: " + JSON.stringify(user));
                firebase.database().ref('users/' + user.uid).once('value').then(function (snapshot) {
                    if (snapshot.exists()) {
                        // user exits
                        var _currentUser_3 = firebase.auth().currentUser;
                        me.LoadingProvider.closeLoading();
                        if (_currentUser_3) {
                            console.log('_currentUser on register', _currentUser_3);
                            var userId = _currentUser_3.uid;
                            if (userId != "") {
                                //register successfull then current user data will be load in app for global functionality.
                                firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                                    console.log('userObject ', snapshot.val());
                                    var userObject = snapshot.val();
                                    var displayname = userObject ? userObject.name : "";
                                    var access_code = userObject.access_code;
                                    var profilePic = userObject ? ((userObject.profilePic == "") ? 'assets/image/profile.png' : userObject.profilePic) : 'assets/image/profile.png';
                                    global.USER_IMAGE = profilePic;
                                    global.USER_NAME = displayname;
                                    global.USER_ACCESS_CODE = access_code;
                                    me.events.publish("LOAD_USER_UPDATE", "");
                                    me._zone.run(function () {
                                        localStorage.setItem("IsLogin", 'true');
                                        localStorage.setItem("userId", userId);
                                        me.sqlite.create({
                                            name: 'data.db',
                                            location: 'default'
                                        })
                                            // data will also store in SQLite for ofline works.
                                            .then(function (db) {
                                            me.sqlDb = db;
                                            me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser_3.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                                                .then(function () {
                                                me.navCtrl.setRoot("FriendlistPage");
                                            })
                                                .catch(function (e) { return alert('Unable to insert sql: ' + JSON.stringify(e)); });
                                        });
                                    });
                                });
                            }
                        }
                        else {
                            console.log("User is logged out");
                        }
                    }
                    else {
                        me.LoginWithFirebaseSocialPlugin(user);
                    }
                });
            })
                .catch(function (error) {
                me.LoadingProvider.closeLoading();
                alert("Firebase failure: " + JSON.stringify(error));
            });
        }).catch(function (error) { alert(" this is final " + JSON.stringify(error)); });
    };
    RegisterPage.prototype.LoginWithFirebaseSocialPlugin = function (user) {
        var me = this;
        var access_code = me.CommonProvider.randomString();
        var Regid = localStorage.getItem('RegId');
        /*user data **/
        firebase.database().ref().child('users/' + user.uid).set({
            email: user.email,
            access_code: access_code,
            name: user.displayName,
            gender: '',
            status: '',
            profilePic: '',
            created: new Date().getTime(),
            pushToken: Regid
        }, function (error) {
            if (error) {
                me.LoadingProvider.closeLoading();
                var alert_6 = me.alertCtrl.create({ subTitle: error, buttons: ['OK'] });
                alert_6.present();
            }
            else {
                var _currentUser_4 = firebase.auth().currentUser;
                me.LoadingProvider.closeLoading();
                if (_currentUser_4) {
                    console.log('_currentUser on register', _currentUser_4);
                    var userId = _currentUser_4.uid;
                    if (userId != "") {
                        //register successfull then current user data will be load in app for global functionality.
                        firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                            console.log('userObject ', snapshot.val());
                            var userObject = snapshot.val();
                            var displayname = userObject ? userObject.name : "";
                            var access_code = userObject.access_code;
                            var profilePic = userObject ? ((userObject.profilePic == "") ? 'assets/image/profile.png' : userObject.profilePic) : 'assets/image/profile.png';
                            global.USER_IMAGE = profilePic;
                            global.USER_NAME = displayname;
                            global.USER_ACCESS_CODE = access_code;
                            me.events.publish("LOAD_USER_UPDATE", "");
                            me._zone.run(function () {
                                localStorage.setItem("IsLogin", 'true');
                                localStorage.setItem("userId", userId);
                                me.sqlite.create({
                                    name: 'data.db',
                                    location: 'default'
                                })
                                    // data will also store in SQLite for ofline works.
                                    .then(function (db) {
                                    me.sqlDb = db;
                                    me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser_4.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                                        .then(function () {
                                        me.navCtrl.setRoot("FriendlistPage");
                                    })
                                        .catch(function (e) { return alert('Unable to insert sql: ' + JSON.stringify(e)); });
                                });
                            });
                        });
                    }
                }
                else {
                    console.log("User is logged out");
                }
            }
        });
    };
    RegisterPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-register',
            template: "\n  <ion-header>\n  <ion-navbar>\n      <ion-title  class=\"title\">Register</ion-title>   \n  </ion-navbar>\n</ion-header>\n<ion-content padding class=\"login-container\">\n  <div class=\"logo text-center\">\n    <img src=\"assets/image/logo.png\" />\n  </div>\n  \n   \n \t<form (keyup.enter)=\"RegisterUser()\">\n  <ion-list>\n    <p >Please fill the form below to register for the app</p>\n    <p class=\"error\">{{ error_message }}</p>    \n    <ion-item class=\"txtdesign1\">\n      <ion-input name=\"user_email\" type=\"email\" placeholder=\"Your Email\" [(ngModel)]=\"user_email\"></ion-input>\n    </ion-item>\n    <ion-item>\n      <ion-input name=\"user_password\" type=\"password\" placeholder=\"Your Password\" [(ngModel)]=\"user_password\"></ion-input>\n    </ion-item>\n    <ion-item class=\"txtdesign2\">\n      <ion-input name=\"user_conf_password\"  type=\"password\" placeholder=\"Confirm Password\" [(ngModel)]=\"user_conf_password\"></ion-input>\n    </ion-item>\n\n  </ion-list>\n \t</form>\n  <button ion-button full color=\"primary\" (click)=\"RegisterUser()\" class=\"btndesign\" tappable>Register</button>\n  <button ion-button (click)=\"FacebookLogin()\" class=\"loginBtn loginBtn--facebook\" full tappable>Login with Facebook </button>\n  <button ion-button (click)=\"GoogleLogin()\" class=\"loginBtn loginBtn--google\" full tappable>Login with Google </button>\n\n</ion-content> ",
        }),
        __metadata("design:paramtypes", [Facebook, CommonProvider, GooglePlus, LoadingProvider, SQLite, NgZone, Events, NavController, NavParams, AlertController])
    ], RegisterPage);
    return RegisterPage;
}());
export { RegisterPage };
//# sourceMappingURL=register.js.map