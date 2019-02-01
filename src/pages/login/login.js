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
import { IonicPage, NavController, NavParams, AlertController, ToastController, MenuController } from 'ionic-angular';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { CommonProvider } from '../../providers/common/common';
import { LoadingProvider } from '../../providers/loading/loading';
import { GooglePlus } from '@ionic-native/google-plus';
import * as Message from '../../providers/message/message';
import { Facebook } from '@ionic-native/facebook';
var LoginPage = /** @class */ (function () {
    function LoginPage(fb, googlePlus, LoadingProvider, CommonProvider, sqlite, network, toastCtrl, menu, _zone, events, alertCtrl, navCtrl, navParams) {
        this.fb = fb;
        this.googlePlus = googlePlus;
        this.LoadingProvider = LoadingProvider;
        this.CommonProvider = CommonProvider;
        this.sqlite = sqlite;
        this.network = network;
        this.toastCtrl = toastCtrl;
        this.menu = menu;
        this._zone = _zone;
        this.events = events;
        this.alertCtrl = alertCtrl;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.user_email = "";
        this.user_password = "";
        this.error_message = "";
        //Add a realtime listener
        localStorage.setItem("isFirstTimeLoginTrue", "true");
        this.menu.swipeEnable(false);
    }
    LoginPage.prototype.ionViewDidEnter = function () {
        this.autoLogin();
    };
    LoginPage.prototype.UpdateRegId = function (userid) {
        //this function will update the registration token of current user for push notification if it's not match to firebase current user pushToken.  
        var Regid = localStorage.getItem('RegId');
        firebase.database().ref('users/' + userid).update({
            pushToken: Regid
        });
    };
    LoginPage.prototype.autoLogin = function () {
        //this will call when user already login and not logged out from app.
        var me = this;
        var _currentUser = firebase.auth().currentUser;
        if (me.network.type == "none") {
            //no internet connection
            var uId = localStorage.getItem("userId");
            var me = this;
            //this will load profile data from SQLite when there is no-internet connection.
            me.sqlite.create({
                name: 'data.db',
                location: 'default'
            })
                .then(function (db) {
                me.sqlDb = db;
                if (localStorage.getItem("IsLogin")) {
                    if (localStorage.getItem("IsLogin") == 'true' || localStorage.getItem("IsLogin") == 'True') {
                        db.executeSql('select * from userProfile where user_id = ?', [uId]).then(function (data) {
                            if (data.rows.length > 0) {
                                global.USER_IMAGE = data.rows.item(0).user_profilePic;
                                global.USER_NAME = data.rows.item(0).user_name;
                                global.USER_ACCESS_CODE = data.rows.item(0).user_accessCode;
                                me.events.publish("LOAD_USER_UPDATE", "");
                                me.navCtrl.setRoot("FriendlistPage");
                            }
                        }, function (err) {
                            alert('Unable to select sql: ' + JSON.stringify(err));
                        });
                    }
                }
            });
        }
        //if user is connected to the internet then this function will call and load user profile from firebase.
        else {
            if (_currentUser) {
                me.LoadingProvider.startLoading();
                console.log('_currentUser', _currentUser);
                var userId = _currentUser.uid;
                if (userId != "") {
                    firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                        me.LoadingProvider.closeLoading();
                        if (snapshot.numChildren() != 0) {
                            var userObject = snapshot.val();
                            var displayname = userObject ? userObject.name : "";
                            var access_code = userObject.access_code;
                            var profilePic = userObject ? ((userObject.profilePic == "") ? 'assets/image/profile.png' : userObject.profilePic) : 'assets/image/profile.png';
                            global.USER_IMAGE = profilePic;
                            global.USER_NAME = displayname;
                            global.USER_ACCESS_CODE = access_code;
                            me.events.publish("LOAD_USER_UPDATE", "");
                            me.UpdateRegId(userId);
                            me._zone.run(function () {
                                me.navCtrl.setRoot("FriendlistPage");
                            });
                        }
                    });
                }
            }
        }
    };
    LoginPage.prototype.GoToSignUpPage = function () {
        this.navCtrl.push("RegisterPage");
    };
    LoginPage.prototype.LoginUser = function () {
        /* this function will call when user tap to the login button then function will check email and password to the firebase auth and give permisssion
        to Enter in app and redirect to the friendlist page if user logged in successfull and load user image and their display name and insert data in SQLite userProfile table*/
        var me = this;
        var email = me.user_email;
        var pass = me.user_password;
        if (email != "" && pass != "") {
            me.LoadingProvider.startLoading();
            firebase.auth().signInWithEmailAndPassword(email, pass).then(function (user) {
                firebase.database().ref('users/' + user.uid).once('value').then(function (snapshot) {
                    console.log(snapshot);
                    console.log("in-------");
                    me.LoadingProvider.closeLoading();
                    me.navCtrl.setRoot("FriendlistPage");
                    if (snapshot.numChildren() != 0) {
                        console.log('userObject ', snapshot.val());
                        var userObject = snapshot.val();
                        var displayname = userObject ? userObject.name : "";
                        var access_code = userObject.access_code;
                        var profilePic = userObject ? ((userObject.profilePic == "") ? 'assets/image/profile.png' : userObject.profilePic) : 'assets/image/profile.png';
                        global.USER_IMAGE = profilePic;
                        global.USER_NAME = displayname;
                        global.USER_ACCESS_CODE = access_code;
                        me.events.publish("LOAD_USER_UPDATE", "");
                        me.UpdateRegId(user.uid);
                        me._zone.run(function () {
                            localStorage.setItem("IsLogin", 'true');
                            localStorage.setItem("userId", user.uid);
                            /* me.sqlite.create({
                              name: 'data.db',
                              location: 'default'
                            })
                              .then((db: SQLiteObject) => {
                                me.sqlDb = db;
                                me.sqlDb.executeSql('select * from userProfile where user_id = ?', [user.uid]).then((data) => {
              
                                  if (data.rows.length > 0) {
                                    me.LoadingProvider.closeLoading();
                                    me.navCtrl.setRoot("FriendlistPage");
                                  } else {
                                    me.CommonProvider.toDataUrl(profilePic, function (myBase64) {
                                      me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + user.uid + "','" + userObject.gender + "','" + displayname + "','" + email + "','" + userObject.status + "','" + myBase64 + "','" + userObject.access_code + "')", [])
                                        .then(() => {
                                          me.LoadingProvider.closeLoading();
                                          me.navCtrl.setRoot("FriendlistPage");
                                        })
                                        .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                                    });
                                  }
                                }, (err) => {
                                  alert('Unable to select sql: ' + JSON.stringify(err));
                                });
                              }); */
                        });
                    }
                });
            }, function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    me.LoadingProvider.closeLoading();
                    var alert_1 = me.alertCtrl.create({ subTitle: Message.PASSWORD_WEAK, buttons: ['OK'] });
                    alert_1.present();
                }
                else {
                    me.LoadingProvider.closeLoading();
                    var alert_2 = me.alertCtrl.create({ subTitle: errorMessage, buttons: ['OK'] });
                    alert_2.present();
                }
                me.LoadingProvider.closeLoading();
                console.log(error);
            });
        }
        else {
            me.msg = "";
            var alert_3 = me.alertCtrl.create({ subTitle: Message.FIELD_REQUIRED, buttons: ['OK'] });
            alert_3.present();
        }
    };
    LoginPage.prototype.showForgotPassword = function () {
        var _this = this;
        var prompt = this.alertCtrl.create({
            title: 'Enter your email',
            message: Message.FORGOT_PASSWORD_MSG,
            inputs: [
                {
                    name: 'email',
                    placeholder: 'xyz@example.com'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function (data) {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Submit',
                    handler: function (data) {
                        console.log('Saved clicked');
                        _this.ForgotPassword(data.email);
                    }
                }
            ]
        });
        prompt.present();
    };
    LoginPage.prototype.ForgotPassword = function (email) {
        var me = this;
        //it will call when user tap to the Forgot Password button. user can update their password by entering their email.
        var auth = firebase.auth();
        var emailAddress = email;
        if (emailAddress != "") {
            me.LoadingProvider.startLoading();
            auth.sendPasswordResetEmail(emailAddress).then(function (data) {
                console.log("Email sent");
                me.LoadingProvider.closeLoading();
                var toast = me.toastCtrl.create({
                    message: Message.RESET_PASSWORD_SUCCESS_SENT,
                    duration: 3000,
                    position: 'top'
                });
                toast.present(toast);
            }, function (error) {
                me.LoadingProvider.closeLoading();
                // An error happened.        
                var toast = me.toastCtrl.create({
                    message: error.message,
                    duration: 3000,
                    position: 'top'
                });
                toast.present(toast);
            });
        }
        else {
            var toast = me.toastCtrl.create({
                message: Message.EMAIL_ADDRESS_BLANK,
                duration: 3000,
                position: 'top'
            });
            toast.present(toast);
        }
    };
    LoginPage.prototype.GoogleLogin = function () {
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
    LoginPage.prototype.FacebookLogin = function () {
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
            })
                .catch(function (error) {
                me.LoadingProvider.closeLoading();
                alert("Firebase failure: " + JSON.stringify(error));
            });
        }).catch(function (error) { alert("Error" + JSON.stringify(error)); });
    };
    LoginPage.prototype.LoginWithFirebaseSocialPlugin = function (user) {
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
                var alert_4 = me.alertCtrl.create({ subTitle: error, buttons: ['OK'] });
                alert_4.present();
            }
            else {
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
        });
    };
    LoginPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-login',
            template: "<ion-content padding class=\"login-container\">\n\t<div class=\"logo text-center\">\n\t\t<img src=\"assets/image/logo.png\" />\n\t</div>\n\t<form (keyup.enter)=\"LoginUser()\">\n\t\t<ion-list>\n\t\t\t<p class=\"error\">{{ error_message }}</p>\n\t\t\t<ion-item class=\"txtdesign1\">\n\t\t\t\t<ion-input type=\"email\" name=\"user_email\" placeholder=\"Email\" [(ngModel)]=\"user_email\"></ion-input>\n\t\t\t</ion-item>\n\n\t\t\t<ion-item class=\"txtdesign2\">\n\t\t\t\t<ion-input type=\"password\" name=\"user_password\"  placeholder=\"Password\" [(ngModel)]=\"user_password\"></ion-input>\n\t\t\t</ion-item>\n\n\t\t</ion-list>\n\t</form>\n    <button ion-button full color=\"primary\" (click)=\"LoginUser()\" class=\"btndesign\" tappable>Log In</button>\n    <p text-right ion-text color=\"light\" tappable (click)=\"showForgotPassword()\">Forgot Password?</p>\n    <button ion-button full (click)=\"FacebookLogin()\" class=\"loginBtn loginBtn--facebook\" tappable>Login with Facebook </button>\n    <button ion-button full (click)=\"GoogleLogin()\" class=\"loginBtn loginBtn--google\" tappable>Login with Google </button>\n\t\t<div class=\"gap-2\"></div>\n\t\t<span align=\"center\"><p style=\"color:#ffffff\">New User ?</p></span>\n\t\t<button ion-button full color=\"secondary\" (click)=\"GoToSignUpPage()\" class=\"btndesign\" tappable>Sign Up</button>\n <div *ngIf=\"hide\">\n            <h4 style=\"color:#ccc\" padding text-justify>{{msg}}</h4>\n        </div>\n</ion-content>",
        }),
        __metadata("design:paramtypes", [Facebook, GooglePlus, LoadingProvider, CommonProvider, SQLite, Network, ToastController, MenuController, NgZone, Events, AlertController, NavController, NavParams])
    ], LoginPage);
    return LoginPage;
}());
export { LoginPage };
//# sourceMappingURL=login.js.map