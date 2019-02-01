import { Component, NgZone, ViewChild } from '@angular/core';
import { Content, IonicPage, NavController, NavParams, MenuController, ToastController, ActionSheetController, Platform, ModalController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';
import { LoadingProvider } from '../../providers/loading/loading';
import { global } from '../global/global';
import { DomSanitizer } from '@angular/platform-browser';
//import * as Message from '../../providers/message/message';
declare var firebase;

@IonicPage()

@Component({
   selector: 'AddMembersPage',
    template: `
    <ion-header>
        <ion-navbar>
            <button ion-button icon-only class="back-btn" (click)="goToFriendPage()">
                <ion-icon name='arrow-back'></ion-icon>
            </button>
            <ion-title  class="title">{{groupData.groupName}}</ion-title>
            <div>
              <button ion-button icon-only class="btn" (click)="goToChatRoomMember()" tappable>
                <ion-icon name="options"></ion-icon>
              </button>
            </div>
        </ion-navbar>
    </ion-header>

    <ion-content>
    <div *ngIf="isBusy" class="container" [ngClass]="{'busy': isBusy}">
        <div class="backdrop"></div>
        <ion-spinner></ion-spinner>
    </div>
    <div>

  <ion-list>
     <ion-item-group *ngFor="let message of messagesList; let i = index;">

     <ion-item-divider  style="text-align: center;" *ngIf="showHeader(message,i)" >{{message.DateCreated}}</ion-item-divider>
    <ion-item  class="chat-page-ion-item">
     <div  *ngIf="message.type == 'text'" >
            <ion-row *ngIf="message.userId == myuserid" id="quote-{{message.mkey}}">
                <p class="the-message right-msg" style="width:100%;"><span class="myright"><span  [innerHTML]="message.message" ></span><span class="mtime">{{ message.time}}</span></span>
                </p>
            </ion-row>
            <ion-row *ngIf="message.userId != myuserid" id="quote-{{message.mkey}}" style="margin: 0px;">
                <p class="the-message left-msg" style="width:100%;">
                  <ion-avatar item-left>
                    <ion-img class="imgstyle" src='{{(message.profilePic == "") ? ".assets/image/profile.png" : message.profilePic}}' (click)="showProfile(message)"></ion-img>
                    </ion-avatar>
                <span class="myleft"><span    [innerHTML]="message.message"></span><span class="mtime">{{ message.time}}</span></span>
                </p>
            </ion-row>
      </div>
      <div *ngIf="message.type == 'image'">
        <ion-row *ngIf="message.userId == myuserid" id="quote-{{message.mkey}}">
          <p class="the-message" style="width:100%;"><span class="myright-image"><span > <img (click)="imageTap(message.message)" style="opacity: 0.5;" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.message)"/> </span><br><span class="mtime-image">{{ message.time}}</span></span>
          </p>
        </ion-row>
        <ion-row *ngIf="message.userId != myuserid" id="quote-{{message.mkey}}">
          <p class="the-message" style="width:100%;"><span class="myleft-image"><span>  <img style="opacity: 0.5;"  (click)="imageTap(message.message)" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.message)"/></span><br><span class="mtime-image">{{ message.time}}</span></span>
          </p>
        </ion-row>
      </div>
    </ion-item>
    </ion-item-group>
  </ion-list>
    </div>
</ion-content>

<ion-footer>
	<ion-toolbar *ngIf="blockUser" class="blocked-message group-chat">
		<p text-center>{{ blockMsg }}</p>
	</ion-toolbar>
	<ion-toolbar *ngIf="!blockUser" class="group-chat">
		<textarea contenteditable="true" placeholder='Type your message here' [(ngModel)]="message" (click)='inputClick()' class="editableContent"
			placeholder='Type your message here' id="contentMessage"></textarea>

		<ion-buttons end>
     <button ion-button style="color:white;" icon-right (click)='presentActionSheet()' tappable>
                    <ion-icon name='attach'></ion-icon>
                </button>
			<button class="send-btn" ion-button icon-right color='primary' tappable (click)='sendMessage("text")' tappable>            
        <ion-icon name='send'></ion-icon>
      </button>
		</ion-buttons>
	</ion-toolbar>
</ion-footer>
    `,
})

export class GroupChatPage {

    @ViewChild(Content) content: Content;

    usersList: any = new Array();
    groupData: any = {};
    messagesList: any[] = [];
    msg: any;
    myuserid: any;
    hide: boolean = false;
    message: string = "";
    usersData: any;
    blockUser: any = 0;
    private limit = 10;
    loadingmessageCounter: any = 0;
    sqlDb: SQLiteObject;
    constructor( public _DomSanitizer: DomSanitizer,public modalCtrl: ModalController,private camera: Camera, public LoadingProvider: LoadingProvider,public platform: Platform,public actionSheetCtrl: ActionSheetController,public toastCtrl: ToastController,public CommonProvider: CommonProvider, private network: Network, public menu: MenuController, public sqlite: SQLite, public _zone: NgZone, public navCtrl: NavController, public navParams: NavParams/*,private storage: Storage*/) {
        var me = this;
        me.menu.swipeEnable(true);
        var user = JSON.parse(localStorage.getItem("loginUser"));

        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
    }

    ionViewDidLoad() {
        console.log("ionViewDidLoad");
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        me.myuserid = userId;
        me.findChatData();
        me.setScroll();
        firebase.database().ref().child('users/'+userId).on('value',function(user){
          me.usersData = user.val();
          console.log("me.usersData",me.usersData);
        });
        firebase.database().ref().child('GroupChats/' + me.groupData.groupId).limitToLast(me.limit).off("child_added");
      firebase.database().ref().child('GroupChats/' +  me.groupData.groupId).limitToLast(me.limit).on("child_added", function (messages) {
        //me.lastKeyProcess = true;
        console.log("group chat data",messages.val());
        me.loadingmessageCounter++;
        var convertDate = messages.val().DateCreated.split(" ");
        var dateValue = convertDate[0].split("-");
        var timeValue = convertDate[1].split(":");
        var date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
        var time = me.CommonProvider.formatAMPM(date);
        //me.ChatKeys.push(messages.key);
        
        me._zone.run(() => me.messagesList.push({
          'DateCreated': date.toLocaleDateString(),
          'time': time,
          'message': messages.val().message,
          'sender_id': messages.val().sender_id,
          'mkey': messages.key,
          "userId": me.myuserid,
          "type": messages.val().type,
          "profilePic": messages.val().profilePic,
        }));
        
        console.log("msg list",me.messagesList);
          if (me.loadingmessageCounter > 5) {
            setTimeout(() => {
              me.setScroll();
            }, 500);
          } 
      });
    }
    ionViewDidEnter() {
        console.log("ionViewDidEnter");
        console.log(this.groupData.groupName);
        if(this.groupData.groupName != undefined){
          var user = JSON.parse(localStorage.getItem("loginUser"));
          var userId = user.uid;
          console.log("userId----",userId);
          firebase.database().ref('GroupMember/' + this.groupData.groupId +'/'+userId).update({
             unreadCount: 0
          });
        }
    }
    goToFriendPage(){
         this.navCtrl.setRoot("FriendlistPage");
    }
    findChatData(){
       this.groupData = this.navParams.data;
       console.log(this.groupData);
    }
    goToChatRoomMember(){
        this.navCtrl.setRoot("ChatRoomMembers",this.groupData.groupId);
    }
    setScroll() {
      if (this.content._scroll) this.content.scrollToBottom(280);
    }

    inputClick() {
      var me = this;
      var dimensions = me.content.getContentDimensions();
      if (dimensions.scrollHeight - (dimensions.scrollTop + dimensions.contentHeight) <= 300) {
        me.content.scrollTo(0, dimensions.scrollHeight);

      }
    }

    showHeader(record, recordIndex) {
      var records = this.messagesList;
      var date1, date2;
      if (recordIndex != 0) {
        date1 = record.DateCreated;
        date2 = records[recordIndex - 1].DateCreated;
      }

      if (recordIndex === 0 || date1 != date2) {
        return true;
      }
      return false;

    }

    presentActionSheet(){
        console.log("attachment");
        var me = this;
    if (me.network.type == "none") {
      let toast = this.toastCtrl.create({
        message: 'No internet connection.',
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return true;
    }
    else {
      let actionSheet = me.actionSheetCtrl.create({
        title: 'Sending Image Options',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: 'Camera',
            icon: !me.platform.is('ios') ? 'camera' : null,
            handler: () => {
              me.cameraUpload();
            }
          },
          {
            text: 'Gallery',
            icon: !me.platform.is('ios') ? 'image' : null,
            handler: () => {
              me.gallaryUpload();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel', // will always sort to be on the bottom
            icon: !me.platform.is('ios') ? 'close' : null,
            handler: () => {
              console.log('Cancel clicked');
            }
          }]
      });
      actionSheet.present();
    }
    }

    sendMessage(type){
      console.log("msg",type);
      var date = new Date();
      //in case of network type none means no internet connection then user can not send message to other.
      if (this.network.type == "none") {
        let toast = this.toastCtrl.create({
          message: 'No internet connection.',
          duration: 3000,
          position: 'top'
        });
        toast.present();
        return true;
      }
      var user = JSON.parse(localStorage.getItem("loginUser"));
      var userId = user.uid;
      var userEmail = user.email;
      var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
      console.log("userId",userId);
      console.log("userEmail",userEmail);
      console.log("dateCreated",dateCreated);
      console.log("senderName",senderName);

      if (this.message != "") {
        var lastDisplaymessage = this.message.replace(/\r?\n/g, '<br />');
        this.message = "";
        let ta = document.getElementById('contentMessage');
        ta.style.overflow = "hidden";
        ta.style.height = "auto";
        ta.style.height = "45px";

        var me = this;
        firebase.database().ref().child('GroupChats/' + me.groupData.groupId).push({
          DateCreated: dateCreated,
          message: lastDisplaymessage,
          sender_id: userId,
          type : type,
          profilePic : me.usersData.profilePic
        }).then(function () {
          if (type == "text") {
            firebase.database().ref('GroupMember/' + me.groupData.groupId).once('value').then(function (snapshot) {
              var value = snapshot.val();
              for(var i in value){
                var friendData = firebase.database().ref('GroupMember/' + me.groupData.groupId);
                console.log( parseInt(value[i].unreadCount));
                friendData.child(i).update({
                  unreadCount: parseInt(value[i].unreadCount) + 1,
                  lastDate: dateCreated,
                  lastMessage: lastDisplaymessage
                });
              }
            });

            firebase.database().ref('GroupMember/' + me.groupData.groupId + '/' + userId).once('value').then(function (snapshot) {
              var friendRef = firebase.database().ref('GroupMember/' + me.groupData.groupId);
              friendRef.child(userId).update({
                unreadCount: 0,
                lastDate: dateCreated,
                lastMessage: lastDisplaymessage
              });
            });
          }
        });
      }
    }

    cameraUpload(){
        const filename = Math.floor(Date.now() / 1000);
    var me = this;
    me.camera.getPicture({
      quality: 90,
      destinationType: me.camera.DestinationType.DATA_URL,
      encodingType: me.camera.EncodingType.JPEG,
      mediaType: me.camera.MediaType.PICTURE,
      targetWidth: 320,
      targetHeight: 320,
      allowEdit: true,
      correctOrientation: true,
    }).then((imageData) => {
      me.LoadingProvider.startLoading();
      var uploadTask = firebase.storage().ref().child(`${filename}.jpg`).putString(imageData, "base64");
      uploadTask.on('state_changed', function (snapshot) {
      }, function (error) {
        alert(error);
      }, function () {
        var downloadFlyerURL = uploadTask.snapshot.downloadURL;
        me.message = downloadFlyerURL;
        me.sendMessage("image");
        setTimeout(() => {
          me.LoadingProvider.closeLoading();
        }, 200);

      });
    }, (err) => {
      console.log(err);
    });
    }

    gallaryUpload(){
        const filename = Math.floor(Date.now() / 1000);
    var me = this;
    me.camera.getPicture({
      sourceType: me.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: me.camera.DestinationType.DATA_URL,
      quality: 90,
      encodingType: me.camera.EncodingType.JPEG,
      targetWidth: 320,
      targetHeight: 320,
      allowEdit: true,
      correctOrientation: true,
    }).then((imageData) => {
      var uploadTask = firebase.storage().ref().child(`${filename}.jpg`).putString(imageData, "base64");
      uploadTask.on('state_changed', function (snapshot) {
      }, function (error) {
        alert(error);
      }, function () {
        me.LoadingProvider.startLoading();
        var downloadFlyerURL = uploadTask.snapshot.downloadURL;
        me.message = downloadFlyerURL;
        me.sendMessage("image");
        setTimeout(() => {
          me.LoadingProvider.closeLoading();
        }, 200);

      });
    }, (err) => {
      console.log(err);
    });
    }

    imageTap(src) {
    let modal = this.modalCtrl.create("ImagePopupPage", { imageSrc: src });
    modal.present();

    }
    showProfile(user) {
      console.log(user);
      var userData = {
        senderId : user.sender_id
      };
      this.navCtrl.push("ShowProfilePage", userData);
    }

}
