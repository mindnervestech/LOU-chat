import { Component, NgZone, ViewChild,HostListener, ElementRef } from '@angular/core';
import {  Content, IonicPage, NavController, NavParams, MenuController, ToastController, ActionSheetController, Platform, ModalController} from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { PushProvider } from '../../providers/push/push';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';
import { LoadingProvider } from '../../providers/loading/loading';
import { global } from '../global/global';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Router
} from '@angular/router';

//import * as Message from '../../providers/message/message';
declare var firebase;

@IonicPage()

@Component({
   selector: 'AddMembersPage',
    template: `
    <ion-header (click)="picker()">
        <ion-navbar class="grop-exit">
            <button ion-button icon-only class="back-btn" (click)="goToFriendPage()">
                <ion-icon name='arrow-back'></ion-icon>
            </button>
            <ion-title  class="title">{{groupData.type}} {{trainNo}}</ion-title>
          <div>
              <button ion-button icon-only class="btn circle" (click)="goToChatRoomMember()" tappable>
                <img src="assets/image/groupchat.png" width="40px" height="40px">
              </button>
              </div>
            
        </ion-navbar>
    </ion-header>

    <ion-content (click)="picker()">
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
            <ion-row *ngIf="message.sender_id == myuserid" id="quote-{{message.mkey}}">
              <p class="right-mtime">{{ message.time}}</p>
              <p class="the-message right-msg" style="width:100%;"><span class="myright"><span  [innerHTML]="message.message" ></span></span></p>
            </ion-row>
            <ion-row *ngIf="message.sender_id != myuserid" id="quote-{{message.mkey}}">
              <p class="left-mtime"><span> <span *ngIf="message.profilePic != 'assets/image/profile.png'"><img (click)="imageTap(message.profilePic)" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.profilePic)"/></span><span (click)="imageTap(message.profilePic)" class="group-text-image" *ngIf="message.profilePic == 'assets/image/profile.png'"><span>{{message.slice}}</span></span><span class="sender-name">{{message.name}}, </span><span>{{message.time}}</span></span></p>
              <p class="the-message left-msg" style="width:100%;">
                <span class="myleft"><span [innerHTML]="message.message"></span></span>
              </p>
            </ion-row>
      </div>
      <div *ngIf="message.type == 'image'">
        <ion-row *ngIf="message.sender_id == myuserid" id="quote-{{message.mkey}}">
          <p class="right-mtime">{{ message.time}}</p>
          <p class="the-message" style="width:100%;"><span class="myright-image"><span> <img (click)="imageTap(message.message)" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.message)"/> </span></span>
          </p>
        </ion-row>
        <ion-row *ngIf="message.sender_id != myuserid" id="quote-{{message.mkey}}">
          <p class="left-mtime"><span> <span *ngIf="message.profilePic != 'assets/image/profile.png'"><img (click)="imageTap(message.profilePic)" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.profilePic)"/></span><span (click)="imageTap(message.profilePic)" class="group-text-image" *ngIf="message.profilePic == 'assets/image/profile.png'"><span>{{message.slice}}</span></span><span class="sender-name">{{message.time}}</span></span></p>  
          <p class="the-message" style="width:100%;"><span class="myleft-image"><span>  <img (click)="imageTap(message.message)" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.message)"/></span></span>
          </p>
        </ion-row>
      </div>
    </ion-item>
    </ion-item-group>
  </ion-list>
    </div>
    <p style="text-align: center;color:#bdbdbd" *ngIf="groupNotActive == false">------{{Group chat ended------</p>
</ion-content>
<ion-footer [style.height]="showEmojiPicker ? '311px' : 'auto'" class="f-class">
	<ion-toolbar *ngIf="blockUser" class="blocked-message group-chat">
		<p text-center>{{ blockMsg }}</p>
	</ion-toolbar>
  <ion-toolbar *ngIf="!blockUser" class="group-chat">
    <ion-item class="chat-group">
      <textarea rows="2" contenteditable="true" (focusin)="onFocus()" placeholder='Type your message here' [(ngModel)]="message" (click)='inputClick()' class="editableContent"
        placeholder='Type your message here' id="contentMessage"></textarea>
        <button ion-button style="color:white;" class="attach-file" icon-right (click)='presentActionSheet()' tappable>
          <ion-icon name='attach'></ion-icon>
        </button>
        <button *ngIf="showEmojiPicker == true" ion-button class="emoji-show"
        (click)="picker()">
          <ion-icon name="md-happy"></ion-icon>
        </button>
    </ion-item>    
		<ion-buttons end style="margin-bottom: -3px;">
			<button class="send-btn" ion-button icon-right color='primary' tappable (click)='sendMessage("text")' tappable>            
        <ion-icon name='send'></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
  <button ion-button class="emoji"
    (click)="toggled = !toggled && showEmojiPicker = !showEmojiPicker"
    [(emojiPickerIf)]="toggled"
    [emojiPickerDirection]="'bottom'"
    (emojiPickerSelect)="handleSelection($event)">
      <ion-icon name="md-happy"></ion-icon>
  </button>
</ion-footer>
    `,
})

export class GroupChatPage {

    @ViewChild(Content) content: Content;
    @HostListener("input", ["$event.target"])
    onInput(textArea: HTMLTextAreaElement): void {
      this.adjust();
    }
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
    pushTokenId: any = [];
    capitalize: string;
    toggled: boolean = false;
    chatMessage: string;
    showEmojiPicker: boolean = false;
    trainNo: string = '';
    groupNotActive: boolean;
    modal: any;
    constructor( public element:ElementRef,public _DomSanitizer: DomSanitizer,public modalCtrl: ModalController,private camera: Camera, public LoadingProvider: LoadingProvider,public platform: Platform,public actionSheetCtrl: ActionSheetController,public toastCtrl: ToastController,public CommonProvider: CommonProvider, private network: Network, public menu: MenuController, public sqlite: SQLite, public _zone: NgZone, public navCtrl: NavController, public navParams: NavParams, public PushProvider: PushProvider) {
        var me = this;
        me.menu.swipeEnable(true);
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var option = JSON.parse(localStorage.getItem("option"));
        me.trainNo = option.optionValue;
        global.Is_CHAT_PAGE = true;
        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
        global.backPage = "FriendlistPage";
        global.page = "group";  
      }
  
    ionViewDidLoad() {
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        me.myuserid = userId;
        //me.findChatData();
        var data = JSON.parse(localStorage.getItem("Group"));
        me.groupData = data;
        me.setScroll();
        firebase.database().ref().child('users/'+userId).on('value',function(user){
          me.usersData = user.val();
        });
        firebase.database().ref().child('GroupChats/' + me.groupData.groupId).limitToLast(me.limit).off("child_added");
      firebase.database().ref().child('GroupChats/' +  me.groupData.groupId).limitToLast(me.limit).on("child_added", function (messages) {
        //me.lastKeyProcess = true;
        me.loadingmessageCounter++;
        var convertDate = messages.val().DateCreated.split(" ");
        var dateValue = convertDate[0].split("-");
        var timeValue = convertDate[1].split(":");
        var date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
        var time = me.CommonProvider.formatAMPM(date);
        //me.ChatKeys.push(messages.key);
        var userRegisterdData = new Date(me.usersData.created);
        if (date >= userRegisterdData) {
          me._zone.run(() => me.messagesList.push({
            'DateCreated': date.toLocaleDateString(),
            'time': time,
            'message': messages.val().message,
            'sender_id': messages.val().sender_id,
            'mkey': messages.key,
            "userId": me.myuserid,
            "type": messages.val().type,
            "profilePic": (messages.val().profilePic != "") ? messages.val().profilePic  : "assets/image/profile.png",
            "name": messages.val().name,
            "slice": messages.val().name.slice(0,2)
          }));
          if (me.loadingmessageCounter > 5) {
            setTimeout(() => {
              me.setScroll();
            }, 500);
          }
        }
      });
      firebase.database().ref('Group/'+ me.groupData.key).on("value",function(groupData){
        me.groupNotActive = groupData.val().groupActivated
      }) 
    }
    ionViewWillLeave(){
      this.modal.dismiss();
    }
    handleSelection(event) {
      this.message += event.char;
    }
    onFocus(){
      this.showEmojiPicker = false;
    }
    picker(){
      this.showEmojiPicker = false;
    }
    adjust(): void {
      //  let ta = this.element.nativeElement.querySelector("textarea");
      let ta = document.getElementById('contentMessage');
      ta.style.height = "45px";
      if (ta.scrollHeight > 45) {
        ta.style.overflow = "hidden";
        ta.style.height = "auto";
        ta.style.height = ta.scrollHeight + "px";
        if (ta.scrollHeight > 120) {
          ta.style.height = "120px";
          ta.style.overflow = "scroll";
        }
      }
      let textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
      textArea.style.height = 'auto';
      if (textArea.scrollHeight < 100) {
        textArea.style.height = textArea.scrollHeight + "px";
        textArea.style.overflowY = 'hidden';
      } else {
        textArea.style.height = "100px";
        textArea.style.overflowY = 'auto';
      }
    }

    ionViewDidEnter() {
      this.counterZero();
    }
    counterZero(){
      if(this.groupData.groupName != undefined){
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        firebase.database().ref('GroupMember/' + this.groupData.groupId +'/'+userId).update({
           unreadCount: 0
        });
      }
    }
    goToFriendPage(){
      this.counterZero();
         this.navCtrl.setRoot("FriendlistPage");
    }
    findChatData(){
      var data = JSON.parse(localStorage.getItem("Group"));
       this.groupData = data;
    }
    goToChatRoomMember(){
      global.backPage = "GroupChatPage";
      localStorage.setItem("member",'true');
        this.navCtrl.push("ChatRoomMembers");
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

    strip(html) {
      var tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }

    sendMessage(type){
      this.showEmojiPicker = false;
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
          profilePic : me.usersData.profilePic,
          name: me.usersData.name
        }).then(function () {
          if (type == "text") {
            firebase.database().ref('GroupMember/' + me.groupData.groupId).once('value').then(function (snapshot) {
              var value = snapshot.val();
              for(var i in value){
                var friendData = firebase.database().ref('GroupMember/' + me.groupData.groupId);
                friendData.child(i).update({
                  unreadCount: parseInt(value[i].unreadCount) + 1,
                  lastDate: dateCreated,
                  lastMessage: lastDisplaymessage
                });
                firebase.database().ref('users/'+ i).on('value',function(pushToken){
                  //userToken.push(pushToken.val().pushToken);
                  console.log("pushToken",pushToken.val());
                  var group = JSON.parse(localStorage.getItem("option"));
                  var title = "You have new message from " + group.tripeValue + ' ' + group.optionValue;
                  var login = JSON.parse(localStorage.getItem("loginUser"));
                  var body = me.strip(lastDisplaymessage);
                  var app = localStorage.getItem("AppId");
                  if(user.name != pushToken.val().name && app != pushToken.val().pushToken){
                    me.PushProvider.PushNotification(pushToken.val().pushToken, title, body);
                    console.log("pushToken.val().name",pushToken.val().name);
                  }  
                });
              }
            })
            .then(function () {
              /* var group = JSON.parse(localStorage.getItem("option"));
              var login = JSON.parse(localStorage.getItem("loginUser"));
              console.log("Message send successfully",group.tripeValue);
              var title = "You have new Msg from" + group.tripeValue;
              var body = login.name + ' ' +  me.strip(lastDisplaymessage);
              console.log("body",body);
              var data = JSON.parse(localStorage.getItem("Group"));
              firebase.database().ref('GroupMember/'+ data.groupId).on('value',function(userData){
                // me.pushTokenId = userData.val().pushToken;
                console.log("++++++++++",userData.val());
                var userToken = [];
                for(var i in userData.val()){
                  console.log("i ", i, " --- ", user.uid);
                  if(i != user.uid){
                    console.log("1234");
                    firebase.database().ref('users/'+ i).on('value',function(pushToken){
                      //userToken.push(pushToken.val().pushToken);
                      //me.PushProvider.PushNotification(pushToken.val().pushToken, title, body);
                    });
                  }
                }     
                console.log("pushToken",userToken);
                me.PushProvider.PushNotification(userToken, title, body);
              });
              me.PushProvider.PushNotification(me.senderUser.RegId, title, body); */
            
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
    this.modal = this.modalCtrl.create("ImagePopupPage", { imageSrc: src });
    this.modal.present();

    }
    showProfile(user) {
      global.backPage = "GroupChatPage";
      console.log(user);
      var userData = {
        senderId : user.sender_id
      };
      this.navCtrl.push("ShowProfilePage", userData);
    }

}
