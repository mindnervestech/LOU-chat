import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, ModalController} from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { global } from '../global/global';
import { TranslateService } from '@ngx-translate/core';
declare var firebase;

@IonicPage()
@Component({
    selector: 'page-show-profile',
    template: `
    <ion-header>
        <ion-toolbar color="light" class="chat-room">
            <ion-row>
                <ion-icon name="arrow-back" (click)="goTo()"></ion-icon>
                <ion-title  class="title">Profile</ion-title>   
            </ion-row>    
        </ion-toolbar>
    </ion-header>

    <ion-content>
        <div class="profile-image-container">
            <ion-img  *ngIf="userInfo.user_profilePic != 'assets/image/profile.png'" id="profile-image" [src]="userInfo.user_profilePic"  (click)="imageTap(userInfo.user_profilePic)"></ion-img>
            <span class="user-i" *ngIf="userInfo.user_profilePic == 'assets/image/profile.png'"><span>{{userInfo.user_slice}}</span></span>
            <div class="user-info">
                <span class="info-label"><ion-icon name="person"></ion-icon> <span class="name">{{userInfo.user_name}}</span><span class="name" *ngIf="userInfo.user_name == ''">-</span></span>
                <span class="info-label"><ion-icon name="woman"></ion-icon><ion-icon name="man"></ion-icon> <span class="name">{{userInfo.user_gender}}</span><span class="name" *ngIf="userInfo.user_gender == ''">-</span></span>
                <span class="info-label"><ion-icon name="body"></ion-icon> <span class="name">{{userInfo.user_age}}</span><span class="name" *ngIf="userInfo.user_age == ''">-</span></span>
                <span class="info-label"><ion-icon name="text"></ion-icon> <span class="name">{{userInfo.user_status}}</span><span class="name" *ngIf="userInfo.user_status == ''">-</span></span>
            </div>
                <!-- <img id="profile-image" [src]="userInfo.user_profilePic" *ngIf="this.captureDataUrl" /> -->
        </div>
        <!--<div padding class="user-info">
            <ion-item><p><span class="label">Gender:</span> <span class="info-label">{{userInfo.user_gender}}</span></p></ion-item>
            <ion-item><p><span class="label">Age:</span> <span class="info-label">{{userInfo.user_age}}</span></p></ion-item>
            <ion-item><p><span class="label">Status:</span> <span class="info-label">{{userInfo.user_status}}</span></p></ion-item>  
        </div>-->
        <ion-item class="data-option" *ngIf="trepOption.length != 0">
            <h2>{{ 'Purpose of trip' | translate }}</h2>
            <!--<div class="info-b" *ngFor="let data of trepOption">{{data.option}}</div>-->
            <button id="1" #f ion-button color="dark" *ngFor="let data of trepOption">{{data.option}}</button>
        </ion-item>
        <ion-item class="data-option" *ngIf="information.length != 0">
            <h2>{{ 'Topics that interest you' | translate }}</h2>
            <!--<div class="info-b" *ngFor="let value of information">{{value.option}}</div>-->
            <button id="1" #f ion-button color="dark" *ngFor="let value of information">{{value.option}}</button>
        </ion-item>
        <ion-item class="data-option" *ngIf="services.length != 0">
            <h2>{{ 'Services' | translate }}</h2>
            <!--<div class="info-b" *ngFor="let value of services">{{value.option}}</div>-->
            <button id="1" #f ion-button color="dark" *ngFor="let value of services">{{value.option}}</button>
        </ion-item>
    </ion-content>
    <ion-footer>
        <div *ngIf="block == 1" class="chat-icon-div">
            <span class="chat-icon" (click)="goToChatPage()"><img src="assets/image/chat.png"></span>
        </div>
    </ion-footer>
    `,
})
export class ShowProfilePage {

    user_name: string;
    user_email: string;
    user_access_code: string;
    user_slice: string;
    private userInfo: any;
    user_gender: string;
    user_status: string;
    block = 1;
    captureDataUrl: string = "assets/image/sea.jpg";
    base64Image: any;
    trepOption: any = new Array();
    information: any = new Array();
    services: any = new Array();
    constructor(public translate: TranslateService,public modalCtrl: ModalController,private network: Network, public events: Events, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
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
                user_age: "",
                user_slice: "",
            }
            var userId = me.navParams.data.senderId;
            global.singleChatData = me.navParams.data;
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
                    //user_email: me.navParams.data.email,
                    user_status: me.navParams.data.status,
                    user_profilePic: me.navParams.data.profilePic,
                    user_age: me.navParams.data.age,
                    user_slice: me.navParams.data.name.slice(0,2),
                    //user_accessCode: me.navParams.data.access_code
                }

            }  // call else if internet connection is available.the currentUser can view the profile of connected user.
            else {
                //data load from firebase.
                firebase.database().ref('users/' + userId).once('value').then(function (snapshot) {
                    var name = snapshot.val() ? snapshot.val().name : "";
                    var email = snapshot.val() ? snapshot.val().email : "";
                    var status = snapshot.val() ? snapshot.val().status : "";
                    var gender = snapshot.val() ? snapshot.val().gender : "";
                    var access_code = snapshot.val() ? snapshot.val().access_code : "";
                    var profilePic = (snapshot.val().profilePic == "") ? 'assets/image/profile.png' : snapshot.val().profilePic;
                    var age = snapshot.val() ? snapshot.val().age : "";
                    me.userInfo = {
                        user_gender: gender,
                        user_name: name,
                        //user_email: email,
                        user_status: status,
                        user_profilePic: profilePic,
                        user_age: age,
                        user_slice: me.navParams.data.name.slice(0,2),
                        //user_accessCode: access_code
                    }

                });
            }
        }
    }
    goToChatPage(){
        var me = this;
        // var user = JSON.parse(localStorage.getItem("loginUser"));
        // firebase.database().ref('Friends/'+ user.uid).on('value',function(user){
        //     var check = "true";
        //     for(var data in user.val()){
        //         if(me.navParams.data.senderId == data){
        //             check = "false";
        //         }
        //     }
        //     if(check == "true"){
        //         var date = new Date();
        //         var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        //         firebase.database().ref().child('Friends/' + user.uid + '/' + me.navParams.data.senderId).set({
        //                     DateCreated : dateCreated,
        //                     lastDate :dateCreated,
        //                     lastMessage :"",
        //                     SenderId :me.navParams.data.senderId,
        //                     block: 0,
        //                     access : true,
        //                     unreadCount : 0,
        //                     name : me.navParams.data.name,
        //                     profilePic : me.navParams.data.profilePic,
        //                 });
        //                 firebase.database().ref().child('Friends/' + me.navParams.data.senderId + '/' + user.uid).set({
        //                     DateCreated : dateCreated,
        //                     lastDate :dateCreated,
        //                     lastMessage :"",
        //                     SenderId :user.uid,
        //                     block: 0,
        //                     access : true,
        //                     unreadCount : 0,
        //                     name : user.name,
        //                     profilePic : user.profilePic,
        //                 });
        //     }
        // });
        me.navCtrl.push("ChatPage",me.navParams.data);
    }
    goTo(){
        this.navCtrl.setRoot("ChatRoomMembers");
    }
    imageTap(src) {
        let modal = this.modalCtrl.create("ImagePopupPage", { imageSrc: src });
        modal.present();
    
    }
    ionViewDidEnter(){
        console.log("ionViewDidEnter")
        this.getLang();
    }
    getLang(){
        var lang = localStorage.getItem('lan');
        this.translate.use(lang);           
        console.log("lang",lang);
    }
    ionViewDidLoad(){
        this.loadUserProfileData();
        
    }
    loadUserProfileData() {
        // this function will load user profile data. from firebase and insert and update in SQLite.
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        var language = localStorage.getItem("language");
        firebase.database().ref('users/' + me.navParams.data.senderId).on('value', function (snapshot) {
            for(var i in snapshot.val().tripe){
                if(snapshot.val().tripe[i]){
                    var value = i;
                    if(i == "Home work trip" && language == "FN"){
                        value = "Trajet domicile-travail";
                    }
                    if(i == "Tourism" && language == "FN"){
                         value = "Tourisme";   
                    }
                    if(i == "Business trip" && language == "FN"){
                        value = "Voyage d?affaire";
                    }
                    if(i == "To visit people" && language == "FN"){
                        value = "Rendre visite ? des personnes";
                    }
                    if(i == "Participate to an event" && language == "FN"){
                        value = "Participer à un évènement";
                    }
                    var option ={
                        option: value
                    };
                    me.trepOption.push(option);
                }
            }
            
            for(var j = 0; j < snapshot.val().information.length; j++){
                if(snapshot.val().information[j].value == true){
                    me.information.push(snapshot.val().information[j]);
                } 
            }
            for(var j = 0; j < snapshot.val().services.length; j++){
                if(snapshot.val().services[j].value){
                    me.services.push(snapshot.val().services[j]);
                }
            }
        });
    }    
}
