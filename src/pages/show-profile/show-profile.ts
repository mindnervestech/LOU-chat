import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
declare var firebase;

@IonicPage()
@Component({
    selector: 'page-show-profile',
    template: `
    <ion-header>
        <ion-navbar>
            <button ion-button menuToggle>
                <ion-icon name='menu'></ion-icon>
            </button>
            <ion-title  class="title">Profile</ion-title>   
        </ion-navbar>
    </ion-header>

    <ion-content>
        <div class="profile-image-container">
        <ion-img  id="profile-image" [src]="userInfo.user_profilePic" *ngIf="this.captureDataUrl" ></ion-img>
      <!-- <img id="profile-image" [src]="userInfo.user_profilePic" *ngIf="this.captureDataUrl" /> -->
         </div>
        <div padding class="user-info">
            <ion-item><h2>Name</h2></ion-item>
            <ion-item><p>Age ,Gender ,Information</p></ion-item>  
        </div>
    </ion-content>
    <ion-footer>
        <div *ngIf="block == 1" class="chat-icon-div">
            <span class="chat-icon" (click)="goToChatPage()">Chat</span>
        </div>
    </ion-footer>
    `,
})
export class ShowProfilePage {

    user_name: string;
    user_email: string;
    user_access_code: string;
    private userInfo: any;
    user_gender: string;
    user_status: string;
    block = 1;
    captureDataUrl: string = "assets/image/sea.jpg";
    base64Image: any;
    constructor(private network: Network, public events: Events, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController, private camera: Camera) {
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var me = this;
        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        } else {
            me.userInfo = {
                user_name: "",
                user_gender: "",
                user_status: "",
                user_profilePic: "",
                user_accessCode: "",
            }
            var userId = me.navParams.data.senderId;
            console.log(userId);
            var loginUserId = user.uid;
            if(me.navParams.data.senderId == loginUserId){
                me.block = 0;
            }
            /* on chat page when user tap to view profile of connected user then this page will be load that data comes from firebase or SQLite.
            if network type is none then data load from SQLite */
            if (me.network.type == "none") {
                me.userInfo = {
                    user_gender: me.navParams.data.gender,
                    user_name: me.navParams.data.name,
                    user_email: me.navParams.data.email,
                    user_status: me.navParams.data.status,
                    user_profilePic: me.navParams.data.profilePic,
                    user_accessCode: me.navParams.data.access_code
                }

            }  // call else if internet connection is available.the currentUser can view the profile of connected user.
            else {
                //data load from firebase.
                firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                    console.log('snapshotss', snapshot.val());
                    var name = snapshot.val() ? snapshot.val().name : "";
                    var email = snapshot.val() ? snapshot.val().email : "";
                    var status = snapshot.val() ? snapshot.val().status : "";
                    var gender = snapshot.val() ? snapshot.val().gender : "";
                    var access_code = snapshot.val() ? snapshot.val().access_code : "";
                    var profilePic = (snapshot.val().profilePic == "") ? 'assets/image/profile.png' : snapshot.val().profilePic;
                    me.userInfo = {
                        user_gender: gender,
                        user_name: name,
                        user_email: email,
                        user_status: status,
                        user_profilePic: profilePic,
                        user_accessCode: access_code
                    }

                });
            }
        }
    }
    goToChatPage(){
        this.navCtrl.push("ChatPage",this.navParams.data);
    }


}