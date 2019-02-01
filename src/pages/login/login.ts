import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, MenuController } from 'ionic-angular';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { CommonProvider } from '../../providers/common/common';
import { LoadingProvider } from '../../providers/loading/loading';
import { GooglePlus } from '@ionic-native/google-plus';
import * as Message from '../../providers/message/message';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
declare var firebase;

@IonicPage()
@Component({
  selector: 'page-login',
  template: `<ion-content padding class="login-container">
	<div class="logo text-center">
		<img src="assets/image/logo.png" />
	</div>
	<form (keyup.enter)="LoginUser()">
		<ion-list>
			<p class="error">{{ error_message }}</p>
			<ion-item class="txtdesign1">
				<ion-input type="email" name="user_email" placeholder="Email" [(ngModel)]="user_email"></ion-input>
			</ion-item>

			<ion-item class="txtdesign2">
				<ion-input type="password" name="user_password"  placeholder="Password" [(ngModel)]="user_password"></ion-input>
			</ion-item>

		</ion-list>
	</form>
    <button ion-button full color="primary" (click)="LoginUser()" class="btndesign" tappable>Log In</button>
    <p text-right ion-text color="light" tappable (click)="showForgotPassword()">Forgot Password?</p>
    <button ion-button full (click)="FacebookLogin()" class="loginBtn loginBtn--facebook" tappable>Login with Facebook </button>
    <button ion-button full (click)="GoogleLogin()" class="loginBtn loginBtn--google" tappable>Login with Google </button>
		<div class="gap-2"></div>
		<span align="center"><p style="color:#ffffff">New User ?</p></span>
		<button ion-button full color="secondary" (click)="GoToSignUpPage()" class="btndesign" tappable>Sign Up</button>
 <div *ngIf="hide">
            <h4 style="color:#ccc" padding text-justify>{{msg}}</h4>
        </div>
</ion-content>`,
})
export class LoginPage {
  user_email: string = "";
  user_password: string = "";
  error_message: string = "";
  msg: any;
  sqlstorage: SQLite;
  sqlDb: SQLiteObject;
  constructor(private fb: Facebook,public googlePlus: GooglePlus, public LoadingProvider: LoadingProvider, public CommonProvider: CommonProvider, private sqlite: SQLite, private network: Network, public toastCtrl: ToastController, public menu: MenuController, private _zone: NgZone, public events: Events, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    //Add a realtime listener
    localStorage.setItem("isFirstTimeLoginTrue", "true");
    this.menu.swipeEnable(false);
  }

  ionViewDidEnter() {
    this.autoLogin();
  }

  UpdateRegId(userid) {
    //this function will update the registration token of current user for push notification if it's not match to firebase current user pushToken.  
    var Regid = localStorage.getItem('RegId');
    firebase.database().ref('users/' + userid).update({
      pushToken: Regid
    });
  }
  autoLogin() {
    //this will call when user already login and not logged out from app.
    var me = this;
    let _currentUser = firebase.auth().currentUser;
    if (me.network.type == "none") {
      //no internet connection
      var uId = localStorage.getItem("userId");
      var me = this;
      //this will load profile data from SQLite when there is no-internet connection.
      me.sqlite.create({
        name: 'data.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          me.sqlDb = db;
          if (localStorage.getItem("IsLogin")) {
            if (localStorage.getItem("IsLogin") == 'true' || localStorage.getItem("IsLogin") == 'True') {
              db.executeSql('select * from userProfile where user_id = ?', [uId]).then((data) => {

                if (data.rows.length > 0) {
                  global.USER_IMAGE = data.rows.item(0).user_profilePic;
                  global.USER_NAME = data.rows.item(0).user_name;
                  global.USER_ACCESS_CODE = data.rows.item(0).user_accessCode;
                  me.events.publish("LOAD_USER_UPDATE", "");
                  me.navCtrl.setRoot("FriendlistPage");
                }
              }, (err) => {
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
              me._zone.run(() => {
                me.navCtrl.setRoot("FriendlistPage");
              });
            }
          });
        }
      }
    }
  }
  GoToSignUpPage() {
    this.navCtrl.push("RegisterPage");
  }

  LoginUser() {
    /* this function will call when user tap to the login button then function will check email and password to the firebase auth and give permisssion 
    to Enter in app and redirect to the friendlist page if user logged in successfull and load user image and their display name and insert data in SQLite userProfile table*/
    var me = this;

    const email = me.user_email;
    const pass = me.user_password;
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
            me._zone.run(() => {
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
          let alert = me.alertCtrl.create({ subTitle: Message.PASSWORD_WEAK, buttons: ['OK'] });
          alert.present();
        } else {
          me.LoadingProvider.closeLoading();
          let alert = me.alertCtrl.create({ subTitle: errorMessage, buttons: ['OK'] });
          alert.present();
        }
        me.LoadingProvider.closeLoading();
        console.log(error);
      });
    }
    else {
      me.msg = "";
      let alert = me.alertCtrl.create({ subTitle: Message.FIELD_REQUIRED, buttons: ['OK'] });
      alert.present();
    }
  }

  showForgotPassword() {
    let prompt = this.alertCtrl.create({
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
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          handler: data => {

            console.log('Saved clicked');
            this.ForgotPassword(data.email);
          }
        }
      ]
    });
    prompt.present();
  }

  ForgotPassword(email: any) {
    var me = this;
    //it will call when user tap to the Forgot Password button. user can update their password by entering their email.
    var auth = firebase.auth();
    var emailAddress = email;
    if (emailAddress != "") {
      me.LoadingProvider.startLoading();
      auth.sendPasswordResetEmail(emailAddress).then(function (data) {
        console.log("Email sent");
        me.LoadingProvider.closeLoading();
        let toast = me.toastCtrl.create({
          message: Message.RESET_PASSWORD_SUCCESS_SENT,
          duration: 3000,
          position: 'top'
        });
        toast.present(toast);
      }, function (error) {
        me.LoadingProvider.closeLoading();
        // An error happened.        
        let toast = me.toastCtrl.create({
          message: error.message,
          duration: 3000,
          position: 'top'
        });
        toast.present(toast);
      });

    }
    else {
      let toast = me.toastCtrl.create({
        message: Message.EMAIL_ADDRESS_BLANK,
        duration: 3000,
        position: 'top'
      });
      toast.present(toast);

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

    }).catch((error) => { alert("Error" + JSON.stringify(error)) });
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
