import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform, AlertController, LoadingController, ActionSheetController,NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { global } from '../pages/global/global';
import { Events } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { Camera } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Deploy } from "@ionic/cloud-angular";
import { Network } from '@ionic-native/network';
//import { DomSanitizer } from '@angular/platform-browser';
import { Facebook /*FacebookLoginResponse*/ } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import {OptionPage} from '../pages/option/option';
import { Firebase } from '@ionic-native/firebase/ngx';
import { TranslateService } from '@ngx-translate/core';
declare var firebase;
declare var senderId: any; // senderId

@Component({
    template: `
    <ion-nav [root]='rootPage' #content swipeBackEnabled='false'></ion-nav>
    <ion-menu [content]='content'>
        <ion-header>
            <ion-toolbar>
                <span align="center"><ion-title>LUO Chat</ion-title></span>
            </ion-toolbar>
        </ion-header>
        <ion-content class="sidemenu-chat">
            <ion-list no-lines id="ProfileDP">
                <ion-item>
                <div id="profileimage"  [ngStyle]="{'background-image': 'url(' + usernameInfo.profilePic + ')'}"                
                 (click)="presentActionSheet()" tappable>

                </div>
             <!--       <ion-avatar>
                        <img class="circular--square"  [src]="_DomSanitizer.bypassSecurityTrustUrl(usernameInfo.profilePic)"  (click)="presentActionSheet()">
                    </ion-avatar> -->
                </ion-item>
                <h4 class="user-name">{{usernameInfo.displayname}}</h4>
            </ion-list>

            <ion-list>
                <button menuClose ion-item *ngFor='let p of pages' (click)='openPage(p)'>
                    {{p.title}}
                </button>
                <button menuClose ion-item (click)='logOutUser()'>
                    Log Out
                </button>
            </ion-list>
        </ion-content>
    </ion-menu>
    `,
    styles: [`

    .sidemenu-chat .circular--square {
        border-radius: 50%;
        overflow: hidden;
         margin-left: 30%;
        margin-top: 5%;
        margin-bottom: 2%;
        height: 30vw;
        width: 30vw;
        box-shadow: 0 0 8px rgba(0, 0, 0, .8);
        -webkit-box-shadow: 0 0 8px rgba(0, 0, 0, .8);
        -moz-box-shadow: 0 0 8px rgba(0, 0, 0, .8);
    }

    .sidemenu-chat .user-name,.sidemenu-chat .access-code{
        color:white;
        text-align: center;
    }
    .sidemenu-chat .thecode{
        color:#ffffff;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
    }

    .sidemenu-chat #ProfileDP
    {
        background:#20cbd4 !important;
        padding-bottom:5px;
        margin-bottom:0px;
    }

    .sidemenu-chat #ProfileDP .item-md
    {
        background:#20cbd4 !important;
    }

     .sidemenu-chat .label-md {
        margin: 0px 0px 0px 0;
     }
     .sidemenu-chat .list-ios[no-lines] ion-list-header, .list-ios[no-lines] ion-item-options, .list-ios[no-lines] .item, .list-ios[no-lines] .item .item-inner {
        background: #20cbd4 !important;
    }
    `]
})

export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = (localStorage.getItem("isFirstTimeLoginTrue") == 'true') ? ((localStorage.getItem("IsLogin") == 'true') ? "FriendlistPage" : "OptionPage") : "WelcomePage";
    sqlstorage: SQLite;
    sqlDb: SQLiteObject;
    items: Array<Object>;
    loading: any;
    pages: Array<{ title: string, component: any }>;
    private usernameInfo = {
        displayname: "",
        profilePic: "assets/image/profile.png",
        accessCode: ""
    };
    base64Image: any;
    constructor(translate: TranslateService,private fb: Facebook,public googlePlus: GooglePlus, /*public _DomSanitizer: DomSanitizer,*/ private network: Network, public deploy: Deploy, private push: Push, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private _zone: NgZone, public events: Events, public platform: Platform, private storage: Storage, public statusBar: StatusBar, public actionSheetCtrl: ActionSheetController, public splashScreen: SplashScreen, private clipboard: Clipboard, private camera: Camera, private sqlite: SQLite,private firebasepush: Firebase) {
        this.initializeApp();
        this.pushSetup();
       /// this.getFirebasetoken();
       // this.getFirebaseNottification();

          /***********/
        // used for an example of ngFor and navigation
        this.pages = [{ title: 'My Profile', component: "ProfilePage" },
        { title: 'User List', component: "FriendlistPage" },
        /* { title: 'Pending Requests', component: "NewrequestPage" },
        { title: 'Send Request', component: "SendrequestPage" } */];
        this.events.subscribe("LOAD_USER_UPDATE", (eventData) => {
            this.usernameInfo.displayname = global.USER_NAME;
           this.usernameInfo.profilePic = (global.USER_IMAGE) ? global.USER_IMAGE : "assets/image/profile.png";
            this.usernameInfo.accessCode = global.USER_ACCESS_CODE;
        });
        
        var user = JSON.parse(localStorage.getItem("loginUser"));
        //this.usernameInfo.profilePic = (user.profilePic == "") ? 'assets/image/profile.png' : user.profilePic;
        if(user){
            this.usernameInfo.displayname = user.name;
            this.usernameInfo.profilePic = (user.profilePic != "") ? user.profilePic  : "assets/image/profile.png";
        }
        var me = this;
        this.storage.clear();
        me.storage.forEach((value, key, index) => {
            me.storage.remove(key);
        });
        if(user){
            me.platform.registerBackButtonAction(() => { 
                if(global.page == "group"){
                    var userId = user.uid;
                    var data = JSON.parse(localStorage.getItem("Group"));
                    firebase.database().ref('GroupMember/' + data.groupId +'/'+userId).update({
                       unreadCount: 0
                    });
                }
                if(global.page == "single"){
                    firebase.database().ref().child('Friends/' + user.uid + '/' + global.singleChatUserKey).update({
                      unreadCount: 0
                    });
                }
                console.log("global.backPage",global.backPage);
                if(global.backPage == "EXIT"){
                    me.platform.exitApp();
                }else{
                    if(global.backPage == ""){
    
                    }else{
                        if(global.backPage =="ChatPage"){
                            console.log("udr data",global.singleChatData);
                            me.nav.setRoot(global.backPage,global.singleChatData);
                        }else{
                            me.nav.setRoot(global.backPage);
                        }
                    }
                }
                global.page = "";
            });
        }
         
    }


    getFirebasetoken(){
        this.firebasepush.getToken()
        .then(token => console.log(`The token is ${token}`)) // save the token server-side and use it to push notifications to this device
        .catch(error => console.error('Error getting token', error));
    }


    getFirebaseNottification(){
        this.firebasepush.onNotificationOpen()
         .subscribe(data => console.log(`User opened a notification ${data}`));
    }

    initializeApp() {
        localStorage.setItem('RegId', "123456");
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();


            //Send Notification
            //senderId is declared globally on index.html and access here to send PushNotification.
           var senderId : any;
            const options: PushOptions = {
                android: {
                    senderID: senderId,
                    sound: 'true',
                },
                ios: {
                    alert: 'true',
                    badge: true,
                    sound: 'false'
                },
                windows: {}
            };
            const pushObject: PushObject = this.push.init(options);
            pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));

            pushObject.on('registration').subscribe((registration: any) => {
                localStorage.setItem('RegId', registration.registrationId);
            });

            pushObject.on('error').subscribe(error => { });
            // ionic Deploy, it is used to deploy project on ionic view no need to install apk again and again it will update directly.
            /*  this.deploy.check().then((snapshotAvailable: boolean) => {
  
                  if (snapshotAvailable) {
                      this.downloadAndInstall();
                  }
                 
              }); 
           */
            //create database and table sqlite
            this.sqlite.create({
                name: 'data.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {
                    //create table friendslist for all friends data of logged in user
                    db.executeSql('CREATE TABLE IF NOT EXISTS friendsList(id INTEGER PRIMARY KEY AUTOINCREMENT,name,profilePic text,email,date,lastDate,senderId,userId,key,unreadMessage INTEGER,lastMessage,block INTEGER,RegId,access_code,gender,status,profileImageUrl text)', {})
                        .then(() => console.log('Created Table friendsList'))
                        .catch(e => alert(e));

                    //create table userprofile for user profile data
                    db.executeSql('CREATE TABLE IF NOT EXISTS userProfile(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id,user_gender,user_name,user_email,user_status,user_profilePic text,user_accessCode)', {})
                        .then(() => console.log('Created Table userProfile'))
                        .catch(e => alert(e));

                    //create table chat data
                    db.executeSql('CREATE TABLE IF NOT EXISTS chat(id INTEGER PRIMARY KEY AUTOINCREMENT,DateCreated,time,isRead,message,sender_id,mkey,userId,recieverId,type)', {})
                        .then(() => console.log('Created Table userProfile'))
                        .catch(e => alert(e));
                });
        });
    }
    downloadAndInstall() {
        const updating = this.loadingCtrl.create({
            content: 'Updating application.....'
        });
        updating.present();
        this.deploy.download().then(() => this.deploy.extract()).then(() => this.deploy.load());
    }
    Copy() {

        this.clipboard.copy(this.usernameInfo.accessCode);

        this.clipboard.paste().then(
            (resolve: string) => {
                alert(resolve);
            },
            (reject: string) => {
            }
        );
    }

    openPage(page) {
        this.nav.push(page.component);
    }



    logOutUser() {
        var me = this;
        localStorage.setItem("IsLogin", "false");
        localStorage.setItem("popUp","false");
         if (this.network.type == "none") {
            //no internet connection
            localStorage.removeItem("option");
            localStorage.removeItem("GroupKey");
            localStorage.removeItem("GroupId");
            localStorage.removeItem("Group");
            me.nav.setRoot("OptionPage");
        }else{
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

    }
    startLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        this.loading.present();
    }

    closeLoading() {
        this.loading.dismiss();
    }

    presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Profile Photo',
            buttons: [
                {
                    text: 'Upload Photo',
                    handler: () => {
                        this.gallaryUpload();
                    }
                },
                {
                    text: 'Take Photo',
                    handler: () => {
                        this.cameraUpload();
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }
    updateUserPoto(){
        var user = JSON.parse(localStorage.getItem("loginUser"));
        firebase.database().ref('users/' + user.uid).update({
            "profilePic" : this.usernameInfo.profilePic
        });
    }

    gallaryUpload() {
        const filename = Math.floor(Date.now() / 1000);
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
        }).then((imageData) => {
            // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            me.usernameInfo.profilePic = me.base64Image;
            var user = JSON.parse(localStorage.getItem("loginUser"));
            var logInUser = {
                name :  user.name,
				access_code : user.access_code,
			    profilePic : me.usernameInfo.profilePic,
				uid : user.uid
            }
            localStorage.setItem("loginUser", JSON.stringify(logInUser));
            me.updateUserPoto();
            var uploadTask = firebase.storage().ref().child(`${filename}.jpg`).putString(imageData, "base64");
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

            });
        }, (err) => {
            console.log(err);
        });
    }
    toDataUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
    cameraUpload() {
        const filename = Math.floor(Date.now() / 1000);
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
        }).then((imageData) => {
            // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            me.usernameInfo.profilePic = me.base64Image;
            var user = JSON.parse(localStorage.getItem("loginUser"));    
            var logInUser = {
                name :  user.name,
				access_code : user.access_code,
			    profilePic : me.usernameInfo.profilePic,
				uid : user.uid
            }
            localStorage.setItem("loginUser", JSON.stringify(logInUser));
            me.updateUserPoto();
            var uploadTask = firebase.storage().ref().child(`${filename}.jpg`).putString(imageData, "base64");
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

            });
        }, (err) => {
            console.log(err);
        });
    }




    pushSetup(){
        const options: PushOptions = {
          android: {
            senderID:'433761680362',
           // senderID:'573991717698'
           // icon: "resources/android/icon/drawable-xhdpi-icon.png"
             // icon: 'assets/imgs/ic_logo.png' ,
              sound: 'true',
              icon: 'icon',
              
          },
          ios: {
              alert: 'true',
              badge: true,
              sound: 'false'
          },
          // windows: {},
          // browser: {
          //     pushServiceURL: 'http://push.api.phonegap.com/v1/push'
          // }
       };
       
       const pushObject: PushObject = this.push.init(options);
       
       
       pushObject.on('notification').subscribe((notification: any) =>  {
       console.log('Received a notification', notification)
       //this.getAllUnreadNotification();
       //var count=LandingPage.notiCount;
       //LandingPage.notiCount=count+1;
       
      //  if(LandingPage.notiCount==0){
      //    LandingPage.notiCount==1;
      //  }else{
      //    var count=LandingPage.notiCount;
      //    LandingPage.notiCount=count+1;
      //  }
      });
       
       pushObject.on('registration').subscribe((registration: any) => {
         console.log('Device registered******', registration)
        localStorage.setItem("AppId",registration.registrationId);
        // this.fcmToken=registration;
        // console.log("FCM**Token**",this.fcmToken.registrationId);
        // localStorage.setItem('FcmToken',this.fcmToken.registrationId);
      });
       
       pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
       }
}
