import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { LoadingProvider } from '../../providers/loading/loading';
import * as Message from '../../providers/message/message';
import { CommonProvider } from '../../providers/common/common';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
declare var firebase;


@IonicPage()
@Component({
  selector: 'page-register',
  template: `
  <ion-header>
  <ion-navbar>
      <ion-title  class="title">Register</ion-title>   
  </ion-navbar>
</ion-header>
<ion-content padding class="login-container">
  <div class="logo text-center">
    <img src="assets/image/logo.png" />
  </div>
  
   
 	<form (keyup.enter)="RegisterUser()">
  <ion-list>
    <p >Please fill the form below to register for the app</p>
    <p class="error">{{ error_message }}</p>    
    <ion-item class="txtdesign1">
      <ion-input name="user_email" type="email" placeholder="Your Email" [(ngModel)]="user_email"></ion-input>
    </ion-item>
    <ion-item>
      <ion-input name="user_password" type="password" placeholder="Your Password" [(ngModel)]="user_password"></ion-input>
    </ion-item>
    <ion-item class="txtdesign2">
      <ion-input name="user_conf_password"  type="password" placeholder="Confirm Password" [(ngModel)]="user_conf_password"></ion-input>
    </ion-item>

  </ion-list>
 	</form>
  <button ion-button full color="primary" (click)="RegisterUser()" class="btndesign" tappable>Register</button>
  <button ion-button (click)="FacebookLogin()" class="loginBtn loginBtn--facebook" full tappable>Login with Facebook </button>
  <button ion-button (click)="GoogleLogin()" class="loginBtn loginBtn--google" full tappable>Login with Google </button>

</ion-content> `,
})
export class RegisterPage {
  user_email: string = "";
  user_password: string = "";
  user_conf_password: string = "";
  error_message: string = "";
  sqlstorage: SQLite;
  sqlDb: SQLiteObject;

  constructor(private fb: Facebook,public CommonProvider: CommonProvider,public googlePlus: GooglePlus, public LoadingProvider: LoadingProvider, private sqlite: SQLite, private _zone: NgZone, public events: Events, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {

  }
  RegisterUser() {
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
              let alert = me.alertCtrl.create({ subTitle: error, buttons: ['OK'] });
              alert.present();
            } else {
              let _currentUser = firebase.auth().currentUser;
              me.LoadingProvider.closeLoading();
              if (_currentUser) {
                console.log('_currentUser on register', _currentUser);
                var userId = _currentUser.uid;
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
                    me._zone.run(() => {
                      localStorage.setItem("IsLogin", 'true');
                      localStorage.setItem("userId", userId);
                      me.sqlite.create({
                        name: 'data.db',
                        location: 'default'
                      })
                        // data will also store in SQLite for ofline works.
                        .then((db: SQLiteObject) => {
                          me.sqlDb = db;
                          me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                            .then(() => {

                              me.navCtrl.setRoot("FriendlistPage");
                            })
                            .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                        });
                    });
                  });
                }
              } else {
                console.log("User is logged out");
              }
            }
          });
        }, function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == 'auth/weak-password') {
            me.LoadingProvider.closeLoading()
            let alert = me.alertCtrl.create({ subTitle: Message.PASSWORD_WEAK, buttons: ['OK'] });
            alert.present();
          } else {
            me.LoadingProvider.closeLoading()
            let alert = me.alertCtrl.create({ subTitle: errorMessage, buttons: ['OK'] });
            alert.present();
          }
        });
      }
      else {
        let alert = me.alertCtrl.create({ subTitle: "Please enter same password both times !", buttons: ['OK'] });
        alert.present();
      }
    }
    else {
      let alert = me.alertCtrl.create({ subTitle: Message.FIELD_REQUIRED, buttons: ['OK'] });
      alert.present();
    }
  }
  GoogleLogin() {
    var me = this;
    me.googlePlus.login({
      'webClientId': '107282482959-tda07b8rbdpslvckrbtk1fessjbb1u15.apps.googleusercontent.com'
    }).then(res => {
      me.LoadingProvider.startLoading();
      localStorage.setItem("isGoogleLogin", "true");
      const firecreds = firebase.auth.GoogleAuthProvider.credential(res.idToken);
      firebase.auth().signInWithCredential(firecreds)
        .then((user) => {
          //  alert("Google Firebase success: " + JSON.stringify(user));

          firebase.database().ref('users/' + user.uid).once('value').then(function (snapshot) {
            if (snapshot.exists()) {
              // user exits
              let _currentUser = firebase.auth().currentUser;
              me.LoadingProvider.closeLoading();
              if (_currentUser) {
                console.log('_currentUser on register', _currentUser);
                var userId = _currentUser.uid;
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
                    me._zone.run(() => {
                      localStorage.setItem("IsLogin", 'true');
                      localStorage.setItem("userId", userId);
                      me.sqlite.create({
                        name: 'data.db',
                        location: 'default'
                      })
                        // data will also store in SQLite for ofline works.
                        .then((db: SQLiteObject) => {
                          me.sqlDb = db;
                          me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                            .then(() => {

                              me.navCtrl.setRoot("FriendlistPage");
                            })
                            .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                        });
                    });
                  });
                }
              } else {
                console.log("User is logged out");
              }
            } else {
              me.LoginWithFirebaseSocialPlugin(user);
            }
          });

        }).catch((err) => {
          me.LoadingProvider.closeLoading();
          alert('Firebase auth failed' + err);
        })
    }).catch(err => JSON.stringify(err));
  }
  FacebookLogin() {
    var me = this;
    me.fb.login(['email']).then((response) => {
      const facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(response.authResponse.accessToken);
      me.LoadingProvider.startLoading();
      localStorage.setItem("isFacebookLogin", "true");
      firebase.auth().signInWithCredential(facebookCredential)
        .then((user) => {
          //  alert("Firebase success: " + JSON.stringify(user));
          firebase.database().ref('users/' + user.uid).once('value').then(function (snapshot) {
            if (snapshot.exists()) {
              // user exits
              let _currentUser = firebase.auth().currentUser;
              me.LoadingProvider.closeLoading();
              if (_currentUser) {
                console.log('_currentUser on register', _currentUser);
                var userId = _currentUser.uid;
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
                    me._zone.run(() => {
                      localStorage.setItem("IsLogin", 'true');
                      localStorage.setItem("userId", userId);
                      me.sqlite.create({
                        name: 'data.db',
                        location: 'default'
                      })
                        // data will also store in SQLite for ofline works.
                        .then((db: SQLiteObject) => {
                          me.sqlDb = db;
                          me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                            .then(() => {

                              me.navCtrl.setRoot("FriendlistPage");
                            })
                            .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                        });
                    });
                  });
                }
              } else {
                console.log("User is logged out");
              }
            } else {
              me.LoginWithFirebaseSocialPlugin(user);
            }
          });
        })
        .catch((error) => {
          me.LoadingProvider.closeLoading();
          alert("Firebase failure: " + JSON.stringify(error));
        });

    }).catch((error) => { alert(" this is final " + JSON.stringify(error)) });
  }

  LoginWithFirebaseSocialPlugin(user) {
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
        let alert = me.alertCtrl.create({ subTitle: error, buttons: ['OK'] });
        alert.present();
      } else {
        let _currentUser = firebase.auth().currentUser;
        me.LoadingProvider.closeLoading();
        if (_currentUser) {
          console.log('_currentUser on register', _currentUser);
          var userId = _currentUser.uid;
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
              me._zone.run(() => {
                localStorage.setItem("IsLogin", 'true');
                localStorage.setItem("userId", userId);
                me.sqlite.create({
                  name: 'data.db',
                  location: 'default'
                })
                  // data will also store in SQLite for ofline works.
                  .then((db: SQLiteObject) => {
                    me.sqlDb = db;
                    me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + userObject.gender + "','" + displayname + "','" + _currentUser.email + "','" + userObject.status + "','" + profilePic + "','" + userObject.access_code + "')", [])
                      .then(() => {

                        me.navCtrl.setRoot("FriendlistPage");
                      })
                      .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                  });
              });
            });
          }
        } else {
          console.log("User is logged out");
        }
      }
    });
} 
}
