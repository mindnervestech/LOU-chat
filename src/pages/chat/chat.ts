import { Component, ViewChild, NgZone, HostListener, ElementRef } from '@angular/core';
import { Platform, Content, IonicPage, NavController, ModalController, NavParams, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { global } from '../global/global';
import { PushProvider } from '../../providers/push/push';
import { CommonProvider } from '../../providers/common/common';
import { Network } from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { LoadingProvider } from '../../providers/loading/loading';
import { ImagePopupPage } from '../image-popup/image-popup';
import * as Message from '../../providers/message/message';
declare var firebase;

/**
 * Generated class for the ChatPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-chat',
  template: `
<ion-header scroll='false' (click)="picker()">
  <ion-toolbar>
    <ion-icon name="arrow-back" class="arrow-back" (click)="goTo()"></ion-icon>
		<ion-title>
			<ion-item class="title-item" no-lines>
				<ion-avatar *ngIf="senderUser.profilePic != 'assets/image/profile.png'" item-start (click)="showProfile(senderUser)" tappable class="prof-icon">
					<img  [src]="_DomSanitizer.bypassSecurityTrustUrl(senderUser.profilePic)"/>
				</ion-avatar>
        <ion-avatar  *ngIf="senderUser.profilePic == 'assets/image/profile.png'" item-start (click)="showProfile(senderUser)" tappable class="prof-icon chat-pro">
					<span>{{textprofile}}</span>
				</ion-avatar>
        	<!--<ion-img  item-start  [src]="senderUser.profilePic" (click)="showProfile(senderUser)" tappable></ion-img>-->

				<h2 *ngIf="senderUser.name" (click)="showProfile(senderUser)" tappable>{{ senderUser.name }}</h2>
				<h2 *ngIf="!senderUser.name" (click)="showProfile(senderUser)" tappable>{{ senderUser.email }}</h2>
				<!--<button ion-button color="light" clear icon-only item-end (click)="showFriendOptions(senderUser)" tappable>
                        <ion-icon name="options"></ion-icon>
                    </button>-->
        <div style="position:absolute;right:0;top:12px;">
              <button ion-button icon-only class="btn circle" (click)="showFriendOptions(senderUser)" tappable>
                <ion-icon name="radio-button-off"></ion-icon>
                <ion-icon name="radio-button-off"></ion-icon>
                <ion-icon name="radio-button-off"></ion-icon>
              </button>
            </div>            
			</ion-item>
		</ion-title>

	</ion-toolbar>
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
          <p class="the-message right-msg" style="width:100%;"><span class="myright"><span  [innerHTML]="message.message" ></span></span>
          </p>
        </ion-row>
        <ion-row *ngIf="message.sender_id == senderUser.senderId" id="quote-{{message.mkey}}">
          <p class="left-mtime"><span (click)="showProfile(senderUser)"><span *ngIf="senderUser.profilePic != 'assets/image/profile.png'"><img  [src]="_DomSanitizer.bypassSecurityTrustUrl(senderUser.profilePic)"/></span><span class="group-text-image" *ngIf="senderUser.profilePic == 'assets/image/profile.png'">{{textprofile}}</span> <span class="sender-name">{{senderUser.name}}</span>, {{ message.time}}</span></p>
          <p class="the-message left-msg" style="width:100%;"><span class="myleft"><span    [innerHTML]="message.message"></span></span>
          </p>
        </ion-row>
      </div>
      <div *ngIf="message.type == 'image'">
        <ion-row *ngIf="message.sender_id == myuserid" id="quote-{{message.mkey}}">
          <p class="right-mtime">{{ message.time}}</p>
          <p class="the-message" style="width:100%;"><span class="myright-image"><span> <img (click)="imageTap(message.message)" style="opacity: 0.5;" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.message)"/> </span></span>
          </p>
        </ion-row>
        <ion-row *ngIf="message.sender_id == senderUser.senderId" id="quote-{{message.mkey}}">
          <p class="left-mtime"><span (click)="showProfile(senderUser)"><img  [src]="_DomSanitizer.bypassSecurityTrustUrl(senderUser.profilePic)"/> <span class="sender-name">{{senderUser.name}}</span>, {{ message.time}}</span></p>      
          <p class="the-message" style="width:100%;"><span class="myleft-image"><span>  <img style="opacity: 0.5;"  (click)="imageTap(message.message)" [src]="_DomSanitizer.bypassSecurityTrustUrl(message.message)"/></span></span>
          </p>
        </ion-row>
      </div>
    </ion-item>
    </ion-item-group>
  </ion-list>

	<!--<ion-list [virtualScroll]="messagesList" [headerFn]="myHeaderFn" [approxItemHeight]="'110px'" bufferRatio="10" no-lines>
		<ion-item-divider *virtualHeader="let header" text-center>
			{{ header}}
		</ion-item-divider>

		<ion-item *virtualItem="let message"  class="chat-page-ion-item">
      <div  *ngIf="message.type == 'text'" >
			<ion-row *ngIf="message.sender_id == myuserid" id="quote-{{message.mkey}}">
				<p class="the-message right-msg" style="width:100%;"><span class="myright"><span  [innerHTML]="message.message" ></span><span class="mtime">{{ message.time}}</span></span>
				</p>
			</ion-row>
			<ion-row *ngIf="message.sender_id == senderUser.senderId" id="quote-{{message.mkey}}">
				<p class="the-message" style="width:100%;"><span class="myleft"><span class="myleft" [innerHTML]="message.message"></span><br><span class="mtime">{{ message.time}}</span></span>
				</p>
			</ion-row>
      </div>
        <div  *ngIf="message.type == 'image'" >
			<ion-row *ngIf="message.sender_id == myuserid" id="quote-{{message.mkey}}">
				<p class="the-message" style="width:100%;"><span class="myright-image"><span > <img (click)="imageTap(message.message)" style="opacity: 0.5;" src="{{ message.message }}"/> </span><br><span class="mtime-image">{{ message.time}}</span></span>
				</p>
			</ion-row>
			<ion-row *ngIf="message.sender_id == senderUser.senderId" id="quote-{{message.mkey}}">
				<p class="the-message" style="width:100%;"><span class="myleft-image"><span>  <img style="opacity: 0.5;"  (click)="imageTap(message.message)" src="{{ message.message }}"/></span><br><span class="mtime-image">{{ message.time}}</span></span>
				</p>
			</ion-row>
      </div>
		</ion-item>
	</ion-list> -->
	</div>
</ion-content>
<ion-footer [style.height]="showEmojiPicker ? '311px' : 'auto'" class="f-class">
	<ion-toolbar class="chat-footer" *ngIf="blockUser" class="blocked-message">
		<p text-center>{{ blockMsg }}</p>
	</ion-toolbar>
	<ion-toolbar *ngIf="!blockUser" class="chat-footer">
		<!--<textarea contenteditable="true" placeholder='Type your message here' [(ngModel)]="message" (click)='inputClick()' class="editableContent"
			placeholder='Type your message here' id="contentMessage"></textarea>-->
      <ion-item class="chat-group">
      <textarea contenteditable="true" (focusin)="onFocus()" placeholder='Type your message here' [(ngModel)]="message" (click)='inputClick()' class="editableContent"
        placeholder='Type your message here' id="contentMessage"></textarea>
        <button ion-button style="color:white;" class="attach-file" icon-right (click)='presentActionSheet()' tappable>
          <ion-icon name='attach'></ion-icon>
        </button>
        <button *ngIf="showEmojiPicker == true" ion-button class="emoji-show"
        (click)="picker()"
          >
            <ion-icon name="md-happy"></ion-icon>
        </button>
    </ion-item>
		<ion-buttons end style="margin-bottom: -3px;">
     <!--<button ion-button style="color:white;" icon-right (click)='presentActionSheet()' tappable>
                    <ion-icon name='attach'></ion-icon>
                </button>-->
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
export class ChatPage {
  @HostListener("input", ["$event.target"])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }

  @ViewChild(Content) content: Content;
  message: string = "";
  senderUser: any = {};
  myuserid: any;
  messagesList: any[] = [];
  mysenderid: any;
  lastKeyProcess = false;
  private limit = 10;
  dynamicArr = [];
  isBusy = false;
  editmsg = false;
  hideStatus: boolean = true;
  blockMsg: any;
  unBlockMsg: any;
  ChatKeys = [];
  blockUser: any = 0;
  block2: any = 0;
  block1: any = 0;
  loading: any;
  friendkey: any;
  sqlstorage: SQLite;
  sqlDb: SQLiteObject;
  loadingmessageCounter: any = 0;
  userImage: any;
  textprofile: string = '';
  pushName: string = '';
  pushId: string = '';
  editorMsg: '';
  showEmojiPicker: boolean = false;
  checkUserPresent = false;
  check = false;
  constructor(public modalCtrl: ModalController, private camera: Camera, public LoadingProvider: LoadingProvider, public platform: Platform, public CommonProvider: CommonProvider, public _DomSanitizer: DomSanitizer, public toastCtrl: ToastController, public sqlite: SQLite, private network: Network, public PushProvider: PushProvider, public element: ElementRef, public actionSheetCtrl: ActionSheetController, public navCtrl: NavController, public _zone: NgZone, public navParams: NavParams, public alertCtrl: AlertController) {
    var user = JSON.parse(localStorage.getItem("loginUser"));
    this.pushName = user.name;
    var me = this;
    if (!user) {
      me.navCtrl.setRoot("OptionPage");
    }
    global.Is_CHAT_PAGE = true;
    global.backPage = "FriendlistPage";
    global.page = "single";
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
  handleSelection(event) {
    console.log("Selected","Selected");
    this.message += event.char;
  }
  onFocus(){
    this.showEmojiPicker = false;
  }
  picker(){
    this.showEmojiPicker = false;
  }
  goTo(){
    this.navCtrl.setRoot("FriendlistPage");
  }
  ionViewDidLoad() {
    //when user comes to this page this function will call.
    var me = this;
    var user = JSON.parse(localStorage.getItem("loginUser"));
    var userId = user.uid;
    me.myuserid = userId;
    me.senderUser = me.navParams.data;
    me.textprofile = me.navParams.data.name.slice(0,2);
    firebase.database().ref('users/'+ me.navParams.data.key).on('value',function(userData){
      var a = userData.val();
      me.pushId = a.pushToken;
    });
    var block1;
    block1 = me.senderUser.block;
    me.block1 = block1;
    global.singleChatUserKey = me.navParams.data.key;
    me.friendkey = me.senderUser.key;
    // checking record for new friend  
    firebase.database().ref().child('Friends/' + user.uid + '/' + me.navParams.data.key).on('value', function(_data){
      if(_data.val() == null) {
        console.log("in if");
        me.checkUserPresent = false;
      }else{
        console.log("in else");
        me.checkUserPresent = true;
        /*firebase.database().ref().child('Friends/' + user.uid + '/' + me.navParams.data.key).update({
          unreadCount: 0
        });*/
      }
    });
    firebase.database().ref('Friends/' + me.senderUser.senderId + '/' + userId).off();
    //it will call if you blocked someone or blocked by someone.
    firebase.database().ref('Friends/' + me.senderUser.senderId + '/' + userId).on('value', function (snapshot) {
      me.block2 = snapshot.val().block;
      if (me.block1 == 0 && me.block2 == 0) {
        me.blockUser = 0;
      } else if (me.block2 == 1) {
        me.blockMsg = Message.SHOW_OTHER_USER_BLOCK_MSG;
        me.blockUser = 1;
      } else if (me.block1 == 1) {
        me.blockMsg = Message.SHOW_BLOCK_MSG;
        me.blockUser = 1;
      }
    });

    me.readMessage();
    // in case of ofline this function will call and load message data from SQLite.
    if (me.network.type == "none") {
      //no internet connection
      me.sqlite.create({
        name: 'data.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          me.sqlDb = db;
          var userId = localStorage.getItem("userId");
          db.executeSql('select * from chat where recieverId = ? and userId =?', [me.senderUser.senderId, userId]).then((data) => {

            if (data.rows.length > 0) {
          
              for (var i = 0; i < data.rows.length; i++) {
                  me._zone.run(() => {
                  me.messagesList.push({
                    'DateCreated': data.rows.item(i).DateCreated,
                    'time': data.rows.item(i).time,
                    'isRead': data.rows.item(i).isRead,
                    'message': data.rows.item(i).message,
                    'sender_id': data.rows.item(i).sender_id,
                    'mkey': data.rows.item(i).mkey,
                    "userId": data.rows.item(i).userId,
                    "type": data.rows.item(i).type,
                  });

                });
              }
            }
          }, (err) => {
            alert('Unable to find data in friendslist: ' + JSON.stringify(err));
          });
        });

    }
    // in case of online this function will call and load message data from firebase.
    else {
      firebase.database().ref().child('Chats/' + me.myuserid + "/" + me.senderUser.senderId).limitToLast(me.limit).off("child_added");
      firebase.database().ref().child('Chats/' + me.myuserid + "/" + me.senderUser.senderId).limitToLast(me.limit).on("child_added", function (messages) {
        me.lastKeyProcess = true;
        me.loadingmessageCounter++;
        var convertDate = messages.val().DateCreated.split(" ");
        var dateValue = convertDate[0].split("-");
        var timeValue = convertDate[1].split(":");
        var date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
        var time = me.CommonProvider.formatAMPM(date);
        me.ChatKeys.push(messages.key);
        me._zone.run(() => me.messagesList.push({
          'DateCreated': date.toLocaleDateString(),
          'time': time,
          'isRead': messages.val().isRead,
          'message': messages.val().message,
          'sender_id': messages.val().sender_id,
          'mkey': messages.key,
          "userId": me.myuserid,
          "type": messages.val().type,
        }));
        //insert message data in SQLite.
        me.sqlite.create({
          name: 'data.db',
          location: 'default'
        })
          .then((db: SQLiteObject) => {
            me.sqlDb = db;
            db.executeSql('select * from chat  where mkey = ?', [messages.key]).then((data) => {
              if (data.rows.length == 0) {
                if (messages.val().type == "text") {
                  me.sqlDb.executeSql("insert into chat(DateCreated,time,isRead,message,sender_id,mkey,userId,recieverId,type) values(?,?,?,?,?,?,?,?,?)", [date.toLocaleDateString(), time, messages.val().isRead, messages.val().message, messages.val().sender_id, messages.key, me.myuserid, me.senderUser.senderId, messages.val().type]).then(() => {
                  })
                    .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                }
                if (messages.val().type == "image") {
                  me.CommonProvider.toDataUrl(messages.val().message, function (myBase64) {             
                    me.sqlDb.executeSql("insert into chat(DateCreated,time,isRead,message,sender_id,mkey,userId,recieverId,type) values(?,?,?,?,?,?,?,?,?)", [date.toLocaleDateString(), time, messages.val().isRead, myBase64, messages.val().sender_id, messages.key, me.myuserid, me.senderUser.senderId, messages.val().type]).then(() => {
                    })
                      .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                  });
                }
              }
            }, (err) => {
              alert('Unable to select sql: ' + JSON.stringify(err));
            });


          });

          if (me.loadingmessageCounter > 5) {
            setTimeout(() => {
              me.setScroll();
            }, 500);
          } 
      });
    }

  }

  readMessage() {
    var me = this;
    //it is for read and unread Message update in firebase if user comes to this page then the current user message will be update in firebase as read message true;
    firebase.database().ref().child('Chats/' + me.myuserid + "/" + me.senderUser.senderId).off();
    var ref = firebase.database().ref().child('Chats/' + me.myuserid + "/" + me.senderUser.senderId);
    ref.on("child_added", function (messages) {

      if (global.Is_CHAT_PAGE == true) {
        if (messages.val().isRead != true) {
          ref.child(messages.key).update({ "isRead": true });
        }

      }
    });
    setTimeout(() => {
      me.setScroll();
    }, 700);
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
  }


  ionViewDidEnter() {
    var me = this;
    me.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        me.sqlDb = db;
      });
    //it is for read and unread Message update in firebase if user comes to this page then the current user message will be update in firebase as read message true;
    var ref = firebase.database().ref().child('Chats/' + me.myuserid + "/" + me.senderUser.senderId);
    ref.once('value', function (snapshot) {
      if (global.Is_CHAT_PAGE == true) {
        snapshot.forEach(function (messages) {
          if (messages.val().isRead != true) {
            ref.child(messages.key).update({ "isRead": true });
          }
        });

      }
    });
    //it is for unreadCount Message update in firebase if user comes to this page then the current user message will be update in firebase as unReadCount as 0;
    /*var friendRef = firebase.database().ref('Friends/' + me.myuserid);
    friendRef.child(me.friendkey).update({
      unreadCount: 0
    });*/
  }

  ionViewWillLeave() {
    var me = this;
    //var friendRef = firebase.database().ref('Friends/' + me.myuserid);
    var user = JSON.parse(localStorage.getItem("loginUser"));

    global.Is_CHAT_PAGE = false;
    //it is for unreadCount Message update in firebase if user leaves the chat page then the current user message will be update in firebase as unReadCount as 0;
    if(me.checkUserPresent == true){
      firebase.database().ref().child('Friends/' + user.uid + '/' + me.navParams.data.key).update({
        unreadCount: 0
      });
    }
  }

  sendMessage(type) {
    //it is for send Message, the current user can send message to connected user;
    var me = this;
    var date = new Date();
    me.showEmojiPicker = false;
    me.check = true;
    //in case of network type none means no internet connection then user can not send message to other.
    if (me.network.type == "none") {
      let toast = me.toastCtrl.create({
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
    //var mylastDate = me.getLastDate(dateCreated);
    var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
    if (me.message != "") {
      var lastDisplaymessage = me.message.replace(/\r?\n/g, '<br />');;
      me.message = "";
      let ta = document.getElementById('contentMessage');
      ta.style.overflow = "hidden";
      ta.style.height = "auto";
      ta.style.height = "45px";
      firebase.database().ref().child('Chats/' + userId + "/" + me.senderUser.senderId).push({
        DateCreated: dateCreated,
        message: lastDisplaymessage,
        sender_id: userId,
        isRead: false,
        type: type
      }).then(function () {
        firebase.database().ref().child('Chats/' + me.senderUser.senderId + "/" + userId).push({
          DateCreated: dateCreated,
          message: lastDisplaymessage,
          sender_id: userId,
          isRead: false,
          type: type
        }).then(function () {
          if (type == "text") {
            console.log("creat");
            firebase.database().ref().child('Friends/' + userId + '/' + me.senderUser.senderId).on('value', function(userData){
              if(userData.val() == null){
                console.log('userData.val()', userData.val());
                
                firebase.database().ref().child('Friends/' + userId + '/' + me.senderUser.senderId).set({
                    DateCreated : dateCreated,
                    lastDate : dateCreated,
                    lastMessage : "",
                    SenderId : me.senderUser.senderId,
                    block: 0,
                    access : true,
                    unreadCount : 0,
                    name : me.senderUser.name,
                    profilePic : me.senderUser.profilePic,
                });
                firebase.database().ref().child('Friends/' + me.senderUser.senderId + '/' + userId).set({
                    DateCreated : dateCreated,
                    lastDate : dateCreated,
                    lastMessage : "",
                    SenderId : userId,
                    block: 0,
                    access : true,
                    unreadCount : 1,
                    name : user.name,
                    profilePic : user.profilePic,
                });
              }else{
                console.log("if user present");
                if(me.check == true){
                  me.check = false;
                  firebase.database().ref('Friends/' + me.senderUser.senderId + '/' + userId).once('value').then(function (snapshot) {
                    var friendRef = firebase.database().ref('Friends/' + me.senderUser.senderId);
                    friendRef.child(userId).update({
                      lastDate: dateCreated,
                      unreadCount: parseInt(snapshot.val().unreadCount) + 1,
                      lastMessage: lastDisplaymessage
                    }).then(function () {
                      console.log("Message send successfully");
                      var title = "You have new message from " + me.pushName;
                      console.log("title",title);
                      var body = me.strip(lastDisplaymessage);
                      me.PushProvider.PushNotification(me.pushId, title, body);
                    });
                  });
                  firebase.database().ref('Friends/' + userId + '/' + me.senderUser.senderId).once('value').then(function (snapshot) {
                    var friendRef = firebase.database().ref('Friends/' + userId);
                    friendRef.child(me.senderUser.senderId).update({
                      lastDate: dateCreated,
                      lastMessage: lastDisplaymessage
                    }).then(function () {

                      console.log("Message send successfully");
                    });
                  });
                }
              }
            });    
          }
        });
      });
    }
  }

  getLastDate(userlastDate) {
        var mylastDate = userlastDate;
        var convertDate = mylastDate.split(" ");
        var dateValue = convertDate[0].split("-");
        var timeValue = convertDate[1].split(":");
        var lastDate = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
        var thelastDate = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
        var todaysDate = new Date();
        if (lastDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
            var time = this.CommonProvider.formatAMPM(thelastDate);
            mylastDate = time;

        } else if (thelastDate.getFullYear() == todaysDate.getFullYear() && thelastDate.getMonth() == todaysDate.getMonth() && thelastDate.getDate() == (todaysDate.getDate() - 1)) {
            mylastDate = "Yesterday";
        } else {
            mylastDate = thelastDate.getDate() + "/" + (thelastDate.getMonth() + 1) + "/" + thelastDate.getFullYear();
        }
        return mylastDate;
    }
    
  strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  myHeaderFn(record, recordIndex, records) {
    //it's for chat Headers here the date will show in the header of the messages.
    var date1, date2;
    if (recordIndex != 0) {
      date1 = record.DateCreated;
      date2 = records[recordIndex - 1].DateCreated;
    }

    if (recordIndex === 0 || date1 != date2) {
      return record.DateCreated;
    }
    return null;
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

  showProfile(user) {
    global.backPage = "ChatPage";
    this.navCtrl.push("ShowProfilePage", user);
  }


  ngAfterViewInit() {
    //it will call when we tap to scroll on screen and the scroll top will show to previous message of chat. 
    var me = this;
    me.content.ionScroll.subscribe(($event: any) => {
      if ($event.scrollTop < 1) {
        if (me.lastKeyProcess) {
          me.show();
          me.loadPreviousMsg().then(
            value => {
              me.dynamicArr.pop();

              if (me.dynamicArr.length == 0) {
                me.lastKeyProcess = false;
                me.hide();
                return;
              }
              var lasScroll = me.messagesList[0];
              me._zone.run(() => {

                var demoArr = me.dynamicArr.reverse();
                for (var i = 0; i < demoArr.length; i++) {
                  me.messagesList.unshift(me.dynamicArr[i]);
                }


              });


              me.lastKeyProcess = true;
              setTimeout(() => {
                me.scrollToId('quote-' + lasScroll.mkey);

              }, 100);
            });
        }
      }
    })
  }

  scrollToId(element: string) {
    let elem = document.getElementById(element);
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var top = box.top + scrollTop - clientTop;
    var cDim = this.content.getContentDimensions();

    var scrollOffset = Math.round(top) + cDim.scrollTop - cDim.contentTop;
    this.content.scrollTo(0, scrollOffset, 0);
    this.hide();
  }



  loadPreviousMsg(): any {
    //it's for load previous message in chat.
    var me = this;
    me.lastKeyProcess = false;
    return firebase.database().ref().child('Chats/' + me.myuserid + "/" + me.senderUser.senderId).orderByKey().endAt(me.ChatKeys[0]).limitToLast(me.limit + 1).once("value", function (Snapshot) {
      me.dynamicArr = [];
      me.ChatKeys = [];
      Snapshot.forEach(function (messages) {
        var convertDate = messages.val().DateCreated.split(" ");
        var dateValue = convertDate[0].split("-");
        var timeValue = convertDate[1].split(":");
        var date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
        var time = me.CommonProvider.formatAMPM(date);
        me.ChatKeys.push(messages.key);
        me._zone.run(() => me.dynamicArr.push({
          'DateCreated': date.toLocaleDateString(),
          'time': time,
          'isRead': messages.val().isRead,
          'message': messages.val().message,
          'sender_id': messages.val().sender_id,
          'mkey': messages.key,
          "userId": me.myuserid,
          "type": messages.val().type
        }));
      });
      return me.dynamicArr;
    });
  }

  show() {
    this._zone.run(() =>
      this.isBusy = true
    );
  }

  hide() {
    this._zone.run(() =>
      this.isBusy = false
    );
  }

  showFriendOptions(user) {
    //by this function the currentUser can view the profile of connected user. and user can block and unblock to the connected user.
    var me = this;
    me.navCtrl.push("ShowProfilePage", user);
    // if (me.network.type == "none") {
    //   let toast = this.toastCtrl.create({
    //     message: 'No internet connection.',
    //     duration: 3000,
    //     position: 'top'
    //   });
    //   toast.present();
    //   return true;
    // }
    // if (me.block1 == 0) {
    //   let actionSheet = this.actionSheetCtrl.create({
    //     buttons: [
    //       {
    //         text: 'View Profile',
    //         handler: () => {
    //           this.navCtrl.push("ShowProfilePage", user);
    //         }
    //       }, {
    //         text: 'Block User',
    //         handler: () => {
    //           console.log('Block User');
    //           var friendRef = firebase.database().ref('Friends/' + me.myuserid);
    //           friendRef.child(me.friendkey).update({
    //             block: 1
    //           }).then(function () {
    //             me.blockUser = 1;
    //             me.block1 = 1;
    //             me.blockMsg = Message.SHOW_BLOCK_MSG;
    //             let alert = me.alertCtrl.create({
    //               title: 'User Blocked',
    //               subTitle: Message.USER_BLOCK_SUCCESS,
    //               buttons: ['OK']
    //             });
    //             alert.present();
    //           });
    //         }
    //       }, {
    //         text: 'Cancel',
    //         role: 'cancel',
    //         handler: () => {
    //           console.log('Cancel clicked');
    //         }
    //       }
    //     ]
    //   });
    //   actionSheet.present();
    // } else if (me.block1 == 1) {
    //   let actionSheet = this.actionSheetCtrl.create({
    //     buttons: [
    //       {
    //         text: 'View Profile',
    //         handler: () => {
    //           this.navCtrl.push("ShowProfilePage", user);
    //         }
    //       }, {
    //         text: 'Unblock User',
    //         handler: () => {
    //           console.log('Unblock User');
    //           var friendRef = firebase.database().ref('Friends/' + me.myuserid);
    //           friendRef.child(me.friendkey).update({
    //             block: 0
    //           }).then(function () {
    //             if (me.block2 == 0) {
    //               me.blockUser = 0;
    //               me.block1 = 0;
    //               let alert = me.alertCtrl.create({
    //                 title: 'User Unblocked',
    //                 subTitle: Message.USER_UNBLOCK_SUCCESS,
    //                 buttons: ['OK']
    //               });
    //               alert.present();
    //             } else if (me.block2 == 1) {
    //               me.blockUser = 1;
    //               me.block1 = 0;
    //               me.blockMsg = Message.SHOW_OTHER_USER_BLOCK_MSG;
    //               let alert = me.alertCtrl.create({
    //                 title: 'User Unblocked',
    //                 subTitle: Message.USER_BLOCK_BY_OTHERUSER,
    //                 buttons: ['OK']
    //               });
    //               alert.present();
    //             }
    //           });
    //         }
    //       }, {
    //         text: 'Cancel',
    //         role: 'cancel',
    //         handler: () => {
    //           console.log('Cancel clicked');
    //         }
    //       }
    //     ]
    //   });
    //   actionSheet.present();
    // }
  }

  presentActionSheet() {
    var me = this;
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

  gallaryUpload() {
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

  cameraUpload() {
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
  imageTap(src) {
    let modal = this.modalCtrl.create("ImagePopupPage", { imageSrc: src });
    modal.present();

  }

}
