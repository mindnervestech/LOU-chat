import { Component, NgZone, ViewChild, } from '@angular/core';
import { Nav, IonicPage, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
//import { UUID } from 'angular2-uuid';
import { Camera } from '@ionic-native/camera';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Clipboard } from '@ionic-native/clipboard';
import { CommonProvider } from '../../providers/common/common';
//import * as Message from '../../providers/message/message';
import { Network } from '@ionic-native/network';
declare var firebase;

@IonicPage()

@Component({
    selector: 'page-profile',
    templateUrl: 'profile-page.html',
       //     template: `
//     <ion-header>
//         <ion-navbar>
//             <button ion-button menuToggle>
//                 <ion-icon name='menu'></ion-icon>
//             </button>
//             <ion-title  class="title">Your Profile</ion-title>   
//         </ion-navbar>
//     </ion-header>

//     <ion-content  class="profile-page">
//         <div class="profile-image-container">
//         <div id="profile-image" [ngStyle]="{'background-image': 'url(' + userInfo.user_profilePic + ')'}" *ngIf="this.captureDataUrl" (click)="presentActionSheet()" tappable> </div> 
//  <!-- <ion-img id="profile-image" [src]="userInfo.user_profilePic" *ngIf="this.captureDataUrl"  (click)="presentActionSheet()" tappable ></ion-img> -->
             
//         <!-- <img id="profile-image" [src]="userInfo.user_profilePic" *ngIf="this.captureDataUrl"  (click)="presentActionSheet()" tappable /> -->
//          </div>
//         <div padding>
//             <h5  (click)="Copy()">Access Code : <span class="secondary-color thecode">{{  userInfo.user_accessCode }}</span></h5>
//             <h5>Email : {{ userInfo.user_email }}</h5>
//             <p>Share this access code to people, so they can send contact request to you.</p>
//             <ion-list>
//                 <ion-item>
//                     <ion-label stacked>Name</ion-label>
//                     <ion-input type='text'  [(ngModel)]='userInfo.user_name' ></ion-input>
//                 </ion-item>
//                 <ion-item>
//                     <ion-label stacked>Gender</ion-label>
//                     <ion-select [(ngModel)]="userInfo.user_gender">
//                         <ion-option value="Male">Male</ion-option>
//                         <ion-option value="Female">Female</ion-option>
//                     </ion-select>
//                 </ion-item>  
//                 <ion-item>
//                     <ion-label stacked>Status</ion-label>
//                     <ion-input type='text'  [(ngModel)]='userInfo.user_status' ></ion-input>
//                 </ion-item>              
//             </ion-list>
//             <button ion-button full tappable (click)='updateProfile()' class="btndesign">Update</button>
//         </div>
//     </ion-content>
//     `,
})

export class ProfilePage {
    @ViewChild(Nav) nav: Nav;
    user_name: string;
    user_email: string;
    user_access_code: string;
    private userInfo: any;
    user_gender: string;
    user_status: string;
    captureDataUrl: string = "assets/image/sea.jpg";
    base64Image: any;
    profilePhoto: string = "assets/image/sea.jpg";
    sqlDb: SQLiteObject;
    gender: string = "";
    age : string = "";
    status : string = "";
    name: string = "";
    trepOption: any = new Array();
    information: any = new Array();
    services: any = new Array();
    profilePage: boolean = false;
    slice: string = "";
    public selectedOption1:boolean = false;
   public selectedOption2:boolean = false;
   public selectedOption3:boolean = false;
   public selectedOption4:boolean = false;
   public selectedOption5:boolean = false;
   public servesOption1:boolean = false;
   public servesOption2:boolean = false;
   public servesOption3:boolean = false;
   counter = 0;
    constructor(public CommonProvider: CommonProvider, public _zone: NgZone, public events: Events, public navCtrl: NavController, public sqlite: SQLite, public navParams: NavParams, public alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController, private camera: Camera, private clipboard: Clipboard,private network: Network) {
        //var user = firebase.auth().currentUser;
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
        global.backPage = "FriendlistPage";

        me.userInfo = {
            user_id: "",
            user_name: "",
            user_gender: "",
            user_status: "",
            user_profilePic: "assets/image/sea.jpg",
            user_accessCode: "",
        }

        this.sqlite.create({
            name: 'data.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
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

    ionViewDidLoad() {
        this.loadUserProfileData();
        this.profilePage = true;
    }
    
    chatPage(){
        this.navCtrl.push("FriendlistPage");   
    }

    infoPage(){
        this.navCtrl.push("InfoPage");   
    }

    mePage(){
        this.navCtrl.push("ProfilePage");   
    }
    btnActivate(ionicButton,text) {
        if(ionicButton._color === 'dark'){
          ionicButton.color =  'primary';
            if(text == 1){
              this.selectedOption1 = true;
            }
            if(text == 2){
              this.selectedOption2 = true;
            }
            if(text == 3){
              this.selectedOption3 = true;
            }
            if(text == 4){
              this.selectedOption4 = true;
            }
            if(text == 5){
              this.selectedOption5 = true;
            }
        }
        else{
          ionicButton.color = 'dark';
          if(text == 1){
              this.selectedOption1 = false;
            }
            if(text == 2){
              this.selectedOption2 = false;
            }
            if(text == 3){
              this.selectedOption3 = false;
            }
            if(text == 4){
              this.selectedOption4 = false;
            }
            if(text == 5){
              this.selectedOption5 = false;
            }
        }
      }

      servesBtnActivate(ionicButton,text){
        if(ionicButton._color === 'dark'){
         ionicButton.color =  'primary';
           if(text == 1){
             this.servesOption1 = true;
           }
           if(text == 2){
             this.servesOption2 = true;
           }
           if(text == 3){
             this.servesOption3 = true;
           }
       }
       else{
         ionicButton.color = 'dark';
           if(text == 1){
             this.servesOption1 = false;
           }
           if(text == 2){
             this.servesOption2 = false;
           }
           if(text == 3){
             this.servesOption3 = false;
           }
       }  
     }
     btnActivateInfo(ionicButton,text) {
        if(ionicButton._color === 'dark'){
          ionicButton.color =  'primary';
          //this.trepOption[text - 1].value = true;
          this.counter++;
        }
        else{
          ionicButton.color = 'dark';
          //this.trepOption[text - 1].value = false;
          this.counter--;
        }
      }
    // btnActivate(ionicButton) {
    //     if(ionicButton._color === 'dark')
    //       ionicButton.color =  'primary';
    //     else
    //       ionicButton.color = 'dark';
    // }
    
    isSelected(event) {
        return 'primary';
        // event.target.getAttribute('selected') ? 'primary' : '';
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
            //me.navCtrl.setRoot("OptionPage");
            console.log("network error");
        }else{
            var groupData = JSON.parse(localStorage.getItem("Group"));
            var user = JSON.parse(localStorage.getItem("loginUser"));
            firebase.database().ref('GroupMember/' + groupData.groupId + "/" + user.uid).remove();
            localStorage.removeItem("option");
            localStorage.removeItem("GroupKey");
            localStorage.removeItem("GroupId");
            localStorage.removeItem("Group");
            me.navCtrl.setRoot("OptionPage");
        }
    }
    loadUserDataFromSqlStorage() {
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        me.sqlDb.executeSql('select * from userProfile where user_id = ?', [userId]).then((data) => {
            if (data.rows.length > 0) {
                me._zone.run(() => {
                    me.userInfo = data.rows.item(0);

                })
            }
        }, (err) => {
            alert('Unable to find data in userProfile: ' + JSON.stringify(err));
        });
    }

    loadUserProfileData() {
        // this function will load user profile data. from firebase and insert and update in SQLite.
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        me.name = user.name;
        me.slice = user.name.slice(0,2);
        var language = localStorage.getItem("language");
        firebase.database().ref('users/' + userId).on('value', function (snapshot) {
            me.trepOption = [];
            for(var i in snapshot.val().tripe){
                    var value = i;
                    if(i == "Home work trip" && language == "FN"){
                        value = "Trajet domicile-travail";
                    }
                    if(i == "Tourism" && language == "FN"){
                         value = "Tourisme";   
                    }
                    if(i == "Business trip" && language == "FN"){
                        value = "Voyage d’affaire";
                    }
                    if(i == "To visit people" && language == "FN"){
                        value = "Rendre visite à des personnes";
                    }
                    if(i == "Participate to an event" && language == "FN"){
                        value = "Participer à un évènement";
                    }
                    var option ={
                        option: value,
                        value: snapshot.val().tripe[i],
                    };
                    me.trepOption.push(option);
                
            }
            me.information = [];
            me.services = [];
            for(var j = 0; j < snapshot.val().information.length; j++){
                    me.information.push(snapshot.val().information[j]);
            }
            for(var j = 0; j < snapshot.val().services.length; j++){
                    me.services.push(snapshot.val().services[j]);
            }
            me.age = snapshot.val() ? snapshot.val().age : "";
            me.status = snapshot.val() ? snapshot.val().status : "";
            me.gender = snapshot.val() ? snapshot.val().gender : "";
            //var profilePic = (snapshot.val().profilePic == "") ? 'assets/image/profile.png' : snapshot.val().profilePic;
            var profilePic = (snapshot.val().profilePic == "") ? 'assets/image/profile.png' : snapshot.val().profilePic;
            me.profilePhoto = profilePic;
            /*me.sqlDb.executeSql('select * from userProfile where user_id = ?', [userId]).then((data) => {
                if (data.rows.length > 0) {
                    if (data.rows.item(0).name != name || data.rows.item(0).status != status || data.rows.item(0).gender != gender || data.rows.item(0).profilePic != profilePic) {
                        me.CommonProvider.toDataUrl(profilePic, function (myBase64) {
                            me.sqlDb.executeSql("UPDATE userProfile SET user_id='" + userId + "',user_gender='" + gender + "',user_name='" + name + "',user_email='" + email + "',user_status='" + status + "',user_profilePic='" + myBase64 + "',user_accessCode='" + access_code + "' where user_id = '" + userId + "'", [])
                                .then(() => {
                                    me.loadUserDataFromSqlStorage();
                                })
                                .catch(e => alert('Unable to update sql: ' + JSON.stringify(e)));
                        });
                    }
                } else {
                    me.CommonProvider.toDataUrl(profilePic, function (myBase64) {
                        me.sqlDb.executeSql("INSERT INTO userProfile(user_id,user_gender,user_name,user_email,user_status,user_profilePic,user_accessCode) VALUES('" + userId + "','" + gender + "','" + name + "','" + email + "','" + status + "','" + myBase64 + "','" + access_code + "')", [])
                            .then(() => {
                                me.loadUserDataFromSqlStorage();
                            })
                            .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                    });
                }
            }, (err) => {
                alert('Unable to select sql: ' + JSON.stringify(err));
            });*/
        });
    }


    gallaryUpload() {
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
        }).then((imageData) => {
            // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            me.profilePhoto = me.base64Image;
            
            var user = JSON.parse(localStorage.getItem("loginUser"));    
            /*var logInUser = {
                name :  user.name,
				access_code : user.access_code,
			    profilePic : me.profilePhoto,
				uid : user.uid
            }
            localStorage.setItem("loginUser", JSON.stringify(logInUser));*/
            var uploadTask = firebase.storage().ref().child(me.CommonProvider.Guid() + ".png").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.userInfo.user_profilePic = downloadFlyerURL;
                //me.profilePhoto = downloadFlyerURL;
                var user = JSON.parse(localStorage.getItem("loginUser"));
                var userId = user.uid;
                //var name = user.name;
                /*var usersRef = firebase.database().ref('users');
                var hopperRef = usersRef.child(userId);
                hopperRef.update({
                    "profilePic": downloadFlyerURL
                });*/
                global.USER_IMAGE = downloadFlyerURL;
                me.PublishEventUserUpdate();
            //     var logInUser = {
            //         name :  me.nickName,
            //         access_code : access_code,
            //         profilePic : phofilePic,
            //         uid : key
            //     };
            // localStorage.setItem("loginUser", JSON.stringify(logInUser));
            
            });
        }, (err) => {
            console.log(err);
        });
    }
    presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Profile Picture',
            buttons: [
                {
                    text: 'Upload from Gallery',
                    handler: () => {
                        this.gallaryUpload();
                    }
                },
                {
                    text: 'Capture from Camera',
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

    cameraUpload() {
        const filename = Math.floor(Date.now() / 1000);
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
        }).then((imageData) => {
            // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            me.profilePhoto = me.base64Image;
            //this.captureDataUrl=this.base64Image;
            var user = JSON.parse(localStorage.getItem("loginUser"));
            /*var logInUser = {
                name :  user.name,
				access_code : user.access_code,
			    profilePic : me.profilePhoto,
				uid : user.uid
            }
            localStorage.setItem("loginUser", JSON.stringify(logInUser));*/
            var uploadTask = firebase.storage().ref().child(`${filename}.jpg`).putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.userInfo.user_profilePic = downloadFlyerURL;
                //me.profilePhoto = downloadFlyerURL;
                var userId = firebase.auth().currentUser.uid;
                /*var usersRef = firebase.database().ref('users');
                var hopperRef = usersRef.child(userId);
                hopperRef.update({
                    "profilePic": downloadFlyerURL
                });*/
                global.USER_IMAGE = downloadFlyerURL;
                me.PublishEventUserUpdate();
            });
        }, (err) => {
            console.log(err);
        });
    }

    updateProfile() {
        var me = this;
        if(me.age == "" && me.status == "" && me.gender == ""){
            let alert = me.alertCtrl.create({ subTitle: 'Please add value in filed', buttons: ['OK'] });
            alert.present();
        }else{
            var user = JSON.parse(localStorage.getItem("loginUser"));
            var userId = user.uid;
            var usersRef = firebase.database().ref('users');
            var hopperRef = usersRef.child(userId);
            hopperRef.update({
                "age":me.age,
                "status": me.status,
                "gender": me.gender,
                "profilePic" : global.USER_IMAGE
            });
            var logInUser = {
                name :  user.name,
                access_code : user.access_code,
                profilePic : global.USER_IMAGE,
                uid : user.uid
            }
            localStorage.setItem("loginUser", JSON.stringify(logInUser));
            
            let alert = me.alertCtrl.create({ subTitle: 'Profile updated successfully', buttons: ['OK'] });
            alert.present();
            me.PublishEventUserUpdate();
        }
    }
    PublishEventUserUpdate() {
        var me = this;
        me.events.publish("LOAD_USER_UPDATE", "");
    }
    Copy() {
        var me = this;
        me.clipboard.copy(me.userInfo.user_accessCode);
        me.clipboard.paste().then(
            (resolve: string) => {
                alert(resolve);
            },
            (reject: string) => {
                // alert('Error: ' + reject);
            }
        );
    }

}
