import { Component, NgZone, ViewChild } from '@angular/core';
import { Slides,Tabs,IonicPage, NavController, NavParams, MenuController, AlertController,ViewController, ModalController} from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import * as Message from '../../providers/message/message';
import { global } from '../global/global';
declare var firebase;

@IonicPage()    

@Component({
   selector: 'page-friendlist',
   //templateUrl: 'friendlist-page.html',
    template: `
   <ion-header>
        <ion-navbar>
            <!--<button ion-button menuToggle>
                <ion-icon name='menu'></ion-icon>
            </button>-->
            <span class="user-profile" (click)="mePage()"><span *ngIf="profilePic != 'assets/image/profile.png'"><img src="{{profilePic}}"></span><span class="text-img" *ngIf="profilePic == 'assets/image/profile.png'">{{userName}}</span></span>
        </ion-navbar>
    </ion-header>
    <ion-content class="friendlist-page-content">
        <div class="modal_content" id="modal_content" *ngIf="hideMe">
            <div class="div_main">
                <ion-icon name="close" (click)="dismiss_dialog()"></ion-icon>
                <ion-slides #slides>
                    <ion-slide *ngFor="let data of tripeUsersList; let i = index">
                        <span *ngIf="data.profilePic != 'assets/image/profile.png'"><img class="img_arrow_down_n" src="{{data.profilePic}}"></span>
                        <span class="text-profile" *ngIf="data.profilePic == 'assets/image/profile.png'">{{data.slice}}</span>
                        <h2 class="subheading_content">You have match with {{data.name}}</h2>
                        <div class="option-scroll">
                            <p *ngIf="data.trepOption.length > 0" class="common-topic">You are traveling for </p>
                            <div class="option" *ngFor="let value of data.trepOption">
                                <p class="common-topic"> {{value}}, </p>
                            </div>
                            <p *ngIf="data.informationOption.length > 0" class="common-topic">and You have the topics:</p>
                            <div class="option" *ngFor="let value of data.informationOption">
                                <p class="common-topic"> {{value}}, </p>
                            </div>
                            <p *ngIf="data.servesOption.length > 0" class="common-topic">and You have</p>
                            <div class="option" *ngFor="let value of data.servesOption">
                                <p class="common-topic"> {{value}}, </p>
                            </div> 
                            <p *ngIf="data.servesOption.length > 0">service in common</p>
                        </div>        
                        <div class="div_bottom">
                            <ion-row justify-content-center align-items-center class="ion_row_heiht_bottam">
                                <button class="dismiss" (click)='dismiss(data,i)'>Dismiss</button>
                                <button class="dismiss" (click)='addToChat(data,i)'>Add to chat list</button>
                            </ion-row>
                        </div>
                    </ion-slide>    
                </ion-slides>
                <button type="submit" float-left ion-button  color="primary" class="btnPrev" (click)="prev()">&#8249;</button>
                <button type="submit" float-right ion-button color="primary" class="btnNext" (click)="next()">&#8250;</button>
                <!-- <div class="div_bottom">
                    <ion-row justify-content-center align-items-center class="ion_row_heiht_bottam">
                        <button class="dismiss" (click)='dismiss()'>Dismiss</button>
                        <button class="dismiss" (click)='addToChat()'>Add to chat list</button>
                    </ion-row>
                </div> -->
            </div>
        </div>
        <ion-list [virtualScroll]="groupData" [approxItemHeight]="'70px'" >
            <ion-item *virtualItem="let data" tappable>
                <ion-avatar item-left class="ion-pro group-img">
                    <!--<ion-img class="imgstyle" src='./assets/image/group.png' (click)="gotToChatRoomMembersPage(data.groupId)"></ion-img>-->
                    <div (click)="gotToChatRoomMembersPage(data.groupId)" class="group-text">
                        <span *ngFor="let item of groupList">{{item.name}}</span>
                    </div>    
                </ion-avatar>
                <div (click)='groupMessageBox(data)'>                
                    <h2>{{ data.groupName }} </h2> 
                    <p (click)='groupMessageBox(data)'>{{ data.lastMessage }} </p>
                </div>               
                <div item-right (click)='groupMessageBox(data)'>
                    <span class="mytime" >{{ data.lastDate }}</span>
                    <ion-badge style="float: right;" *ngIf="data.unreadCount != 0">{{ data.unreadCount }}</ion-badge>  
                </div>
            </ion-item>          
        </ion-list>
        <ion-list [virtualScroll]="usersList" [approxItemHeight]="'70px'" >
            <ion-item *virtualItem="let item" (click)='messageBox($event,item)' tappable>
                <ion-avatar item-left *ngIf="item.profilePic != 'assets/image/profile.png'">
                    <ion-img class="imgstyle" src='{{item.profilePic}}'></ion-img>
                </ion-avatar> 
                <ion-avatar item-left class="name-show" *ngIf="item.profilePic == 'assets/image/profile.png'">
                    <span>{{item.slice}}</span>
                </ion-avatar>
                <h2 *ngIf="item.name" >{{ item.name }} </h2>
                <h2 *ngIf="!item.name">{{ item.email }} </h2>
                
                <p>{{ item.lastMessage }} </p>
                <div item-right>
                <span class="mytime" >{{ item.lastDate }}</span>
                <ion-badge style="float: right;" *ngIf="item.unreadMessage">{{ item.unreadMessage }}</ion-badge>  
                </div>             
            </ion-item>          
        </ion-list>
    </ion-content>
    <ion-footer>
        <ion-toolbar class="option">
            <div class="tab">
                <div class="tab-content" [ngClass]="{'tab-active': friendList == true}">
                    <ion-icon name="chatbubbles"></ion-icon>
                </div>
                <div class="tab-content" (click)="infoPage()">
                    <ion-icon name="bulb"></ion-icon>
                </div>
                <div class="tab-content" (click)="mePage()">
                    <ion-icon name="settings"></ion-icon>
                </div>
            </div>
        </ion-toolbar>
    </ion-footer>
    `,
})

export class FriendlistPage {
    @ViewChild('slides') slides: Slides;
    usersList: any = new Array();
    addToChatList: any = new Array();
    usersListLength: any = Number;
    groupData: any = new Array();
    tripeUsersList: any = new Array();
    trepOption: any = new Array();
    servesOption: any = new Array();
    informationOption: any = new Array();
    preveseFriendList: any = new Array();
    usersKey: any = new Array();
    msg: any;
    hide: boolean = false;
    hideMe: boolean = false;
    sqlDb: SQLiteObject;
    profilePic: string = "";
    checkForEntery: boolean = false;
    check: boolean = true;
    sort: any;
    showPage: boolean = false;
    friendList: boolean = false;
    groupList: any = new Array();
    groupMemberKey: any = new Array();
    userName: string = '';
    count = 0;
    constructor(public modalCtrl: ModalController,public viewCtrl: ViewController,public alertCtrl: AlertController, public CommonProvider: CommonProvider, private network: Network, public menu: MenuController, public sqlite: SQLite, public _zone: NgZone, public navCtrl: NavController, public navParams: NavParams/*,private storage: Storage*/) {
        var me = this;
        me.menu.swipeEnable(true);
        var user = JSON.parse(localStorage.getItem("loginUser"));
        me.profilePic = (user.profilePic == "") ? 'assets/image/profile.png' : user.profilePic; 
        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
        global.backPage = "EXIT";
        this.showPage = true;
        this.userName = user.name.slice(0,2);
    }

    next() {
        this.slides.slideNext();
    }
    
      prev() {
        this.slides.slidePrev();
      }

    ionViewDidLoad() {
        var me = this;
        me.friendList = true;
       /* this.sqlite.create({
            name: 'data.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                me.sqlDb = db;
                //me.LoadList();
            });*/
             var popup = localStorage.getItem("popUp");
             if(popup == "true"){
                me.checkForEntery = true;
                me.getUserData();
             }else{
                me.match();
             }
            me.LoadList();
             me.getChatMemberData();
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
    ionViewDidEnter() {
       /* var me = this;
        this.sqlite.create({
            name: 'data.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                me.sqlDb = db;
                me.loadListFromStorage();
            });*/
    }

    goToAddMemberPage(){
         this.navCtrl.setRoot("AddMembersPage");   
    }
    gotToChatRoomMembersPage(item){
        global.backPage = "FriendlistPage";
        this.navCtrl.push("ChatRoomMembers");
    }

    dismiss_dialog(){
        this.hideMe = false;
        localStorage.setItem("popUp","true");
        this.getUserData();
    }

    dismiss(data,index){
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        firebase.database().ref().child('Friends/' + user.uid).orderByChild("name").equalTo(data.name).on('value',function(friend){
            if(friend.val() == null){

            }else{
                firebase.database().ref().child('Friends/' + user.uid + '/' + data.senderId).update({
                    access : false
                });
            }
        })
        
        me.tripeUsersList.splice(index, 1);
        if(me.tripeUsersList.length == 0){
            me.dismiss_dialog();
            me.usersList = me.addToChatList;
            me.addToChatList= [];
            me.checkForEntery = true;
            me.getUserData();
        }
    }

    getChatMemberData(){
        var user = JSON.parse(localStorage.getItem("Group"));
        var me = this;
         firebase.database().ref('GroupMember/'+ user.groupId).on('value', function (snapshot) {
              var groupData  = snapshot.val();
              me.groupList = [];
              var counter = 0;
              for (var data in groupData ) {
                counter++;  
                if(counter <= 3){
                    me.groupMemberKey.push(data);
                        firebase.database().ref('users/'+ data).on('value', function (snap) {
                            var value = snap.val();
                                var profilePic = value ? ((value.profilePic == "") ? 'assets/image/profile.png' : value.profilePic) : 'assets/image/profile.png';
                                var groupDetail = {
                                    name : value.name.slice(0,2)
                                };
                                me.groupList.push(groupDetail);
                                me.count++;
                        }); 
                    }  
                }
                // setTimeout(() => {
                //     console.log("me.groupList",me.groupList);
                // }, 3000);  
         });
        
    }
    addToChat(data,index){
        var me = this;
        me.addToChatList.push(data);
        me.checkForEntery = false;
        var check = true;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        firebase.database().ref().child('Friends/' + user.uid).orderByChild("name").equalTo(data.name).on('value' ,function(friend){
            if(friend.val() == null){
                if(me.checkForEntery != true){
                    me.checkForEntery = true;
                    var date = new Date();
                    var myProfilePhoto = user.profilePic =="" ? "assets/image/profile.png" : user.profilePic;
                    var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                    firebase.database().ref().child('Friends/' + user.uid + '/' + data.senderId).set({
                        DateCreated : dateCreated,
                        lastDate :dateCreated,
                        lastMessage :"",
                        SenderId :data.senderId,
                        block: 0,
                        access : true,
                        unreadCount : 0,
                        name :data.name,
                        profilePic : data.profilePic =="" ? "assets/image/profile.png" : data.profilePic,
                    }).then(()=>{
                        firebase.database().ref().child('Friends/' + data.senderId + '/' + user.uid).set({
                            DateCreated : dateCreated,
                            lastDate :dateCreated,
                            lastMessage :"",
                            SenderId :user.uid,
                            block: 0,
                            access : true,
                            unreadCount : 0,
                            name : user.name,
                            profilePic : myProfilePhoto,
                        });
                    }); 
                }   
            }else{
                if(me.checkForEntery != true){
                    me.checkForEntery = true;
                        firebase.database().ref().child('Friends/' + user.uid + '/' + data.senderId).update({
                            access : true
                        });
                }
            }
            if(check == true){
                check = false;
                me.tripeUsersList.splice(index, 1);
                if(me.tripeUsersList.length == 0){
                    me.dismiss_dialog();
                    me.usersList = me.addToChatList;
                    me.addToChatList= [];
                    me.checkForEntery = true;
                    me.getUserData();
                }
            }
        });
    }

    addFriend(){
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var me = this;
        var date = new Date();
        var myProfilePhoto = "assets/image/profile.png";
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        firebase.database().ref().child('users/' + user.uid).on('value', function(user){
            myProfilePhoto = user.val().profilePic != "" ? user.val().profilePic : "assets/image/profile.png";
        });
         for(var i = 0; i< me.usersList.length; i++){
                firebase.database().ref().child('Friends/' + user.uid + '/' + me.usersList[i].userId).on('value',function(allFriend){
                    if(allFriend.val() == null){
                         firebase.database().ref().child('Friends/' + user.uid + '/' + me.usersList[i].userId).set({
                            DateCreated : dateCreated,
                            lastDate :dateCreated,
                            lastMessage :"",
                            SenderId :me.usersList[i].senderId,
                            block: 0,
                            access : true,
                            unreadCount : 0,
                            name : me.usersList[i].name,
                            profilePic : me.usersList[i].profilePic,
                        });
                        firebase.database().ref().child('Friends/' + me.usersList[i].userId + '/' + user.uid).set({
                            DateCreated : dateCreated,
                            lastDate :dateCreated,
                            lastMessage :"",
                            SenderId :user.uid,
                            block: 0,
                            access : true,
                            unreadCount : 0,
                            name : user.name,
                            profilePic : myProfilePhoto,
                        });
                    }else{
                        firebase.database().ref().child('Friends/' + user.uid + '/' + me.usersList[i].userId).update({
                            access : true

                        });
                    }
                });
            }
             me.checkForEntery = true;
             me.getUserData();
    }

    getUserData(){
        var me = this;
        var user = JSON.parse(localStorage.getItem("loginUser"));
         firebase.database().ref().child('Friends/' + user.uid).orderByChild("access").equalTo(true).on('value',function(friend){
             if(me.checkForEntery){
                 me.usersList = [];
                 for(var data in friend.val()){
                     var mylastDate = me.getLastDate(friend.val()[data].lastDate);
                     let time = new Date(friend.val()[data].lastDate);
                     var timestamp = time.getTime();
                     var userinfo = {
                            slice: friend.val()[data].name.slice(0,2),
                            name: friend.val()[data].name,
                            profilePic: friend.val()[data].profilePic,
                            date: friend.val()[data].lastDate,
                            lastDate: mylastDate,
                            senderId:  friend.val()[data].SenderId,
                            userId: user.uid,
                            key: friend.val()[data].SenderId,
                            unreadMessage: friend.val()[data].unreadCount,
                            lastMessage: friend.val()[data].lastMessage,
                            block: friend.val()[data].block,
                            checkDate : timestamp
                        };
                        me.usersList.push(userinfo);      
                 }
                  me.usersList.sort(function(a,b){return b.checkDate - a.checkDate});
                 //me.checkForEntery = false;
             }
         });
    }

    match(){
        var userID = localStorage.getItem("userId");
        var language = localStorage.getItem("language");
        var me = this;
        var chackFriend = true;
        firebase.database().ref('users/'+ userID).on('value',function(user){
            var myData = user.val();
            var push = "true";
            var date = new Date();
            var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            var mylastDate = me.getLastDate(dateCreated);
            var groupInfo = JSON.parse(localStorage.getItem("Group"));
            firebase.database().ref('Friends/'+ userID).on('value',function(friendData){
                var friends = friendData.val();
                if(friends == null){

                }else{
                    if(chackFriend){
                        chackFriend = false;
                        for(var value in friends){
                            firebase.database().ref('Friends/'+ userID + '/' + value).update({
                                access : false
                            });
                        }
                    }
                }
            });
             firebase.database().ref('GroupMember/'+ groupInfo.groupId).on('value',function(Alluser){
                 var GroupUserData = Alluser.val();
                 me.tripeUsersList = [];
                 me.usersKey = [];
                 var groupMemberCount = Alluser.numChildren();
                 var count = 1;
                 var keyCount = 0;
                 for(var data in GroupUserData){
                     if(data != userID){
                         me.usersKey.push(data);
                         firebase.database().ref('users/' + data).on('value',function(alluser){
                            count++;
                            var userData = alluser.val();
                            if(userData != null){
                                  me.trepOption = [];
                                  me.servesOption = [];
                                  me.informationOption = [];
                                  if(myData.tripe["Home work trip"]){
                                     if(userData.tripe["Home work trip"] == myData.tripe["Home work trip"]){
                                         if(language == "FN"){
                                             me.trepOption.push("Trajet domicile-travail");
                                         }else{
                                             me.trepOption.push("Home work trip");
                                         }
                                     }
                                 }
                                 if(myData.tripe.Tourism){
                                     if(userData.tripe.Tourism == myData.tripe.Tourism){
                                        if(language == "FN"){
                                             me.trepOption.push("Tourisme");
                                         }else{
                                             me.trepOption.push("Tourism");
                                         }
                                     }
                                 }
                                 if(myData.tripe["Business tripe"]){
                                     if(language == "FN"){
                                             me.trepOption.push("Voyage d’affaire");
                                         }else{
                                             me.trepOption.push("Business tripe");
                                         }
                                 }
                                 if(myData.tripe["To visit people"]){
                                     if(language == "FN"){
                                             me.trepOption.push("Rendre visite à des personnes");
                                         }else{
                                             me.trepOption.push("To visit people");
                                         }
                                 }
                                 if(myData.tripe["Participate to an event"]){
                                     if(language == "FN"){
                                             me.trepOption.push("Participer à un évènement");
                                         }else{
                                             me.trepOption.push("Participate to an event");
                                         }
                                 }
                                 for(var j= 0; j < myData.services.length; j++){
                                     if(myData.services[j].value){
                                         if(myData.services[j].value == userData.services[j].value){
                                             me.servesOption.push(myData.services[j].option);
                                         }
                                     }
                                 }
                                  for(var k= 0; k < myData.information.length; k++){
                                     if(myData.information[k].value){
                                         if(myData.information[k].value == userData.information[k].value){
                                             me.informationOption.push(myData.information[k].option);
                                         }
                                     }
                                 }
                                  var userinfo = {
                                    slice: userData.name.slice(0,2),  
                                    name: userData.name,
                                    profilePic: userData.profilePic ? userData.profilePic : "assets/image/profile.png",
                                    age: userData.age,
                                    lastDate: mylastDate,
                                    unreadMessage: 0,
                                    userId: me.usersKey[keyCount],
                                    lastMessage: "",
                                    date: mylastDate,
                                    senderId : me.usersKey[keyCount],
                                    trepOption : me.trepOption,
                                    informationOption : me.informationOption,
                                    servesOption : me.servesOption,
                                 };
                                 keyCount++;

                                 if(myData.tripe["Home work trip"]){
                                     if(userData.tripe["Home work trip"] == myData.tripe["Home work trip"]){
                                         me.tripeUsersList.push(userinfo);
                                         push = "false";
                                     }
                                 }
                                 if(myData.tripe.Tourism){
                                     if(userData.tripe.Tourism == myData.tripe.Tourism){
                                        if(push == "true"){
                                            me.tripeUsersList.push(userinfo);
                                            push = "false";
                                        }
                                     }
                                 }
                                 if(myData.tripe["Business tripe"]){
                                     if(userData.tripe["Business tripe"] == myData.tripe["Business tripe"]){
                                         if(push == "true"){
                                            me.tripeUsersList.push(userinfo);
                                            push = "false";
                                        }
                                     }
                                 }
                                 if(myData.tripe["To visit people"]){
                                     if(userData.tripe["To visit people"] == myData.tripe["To visit people"]){
                                         if(push == "true"){
                                            me.tripeUsersList.push(userinfo);
                                            push = "false";
                                        }
                                     }
                                 }
                                 if(myData.tripe["Participate to an event"]){
                                     if(userData.tripe["Participate to an event"] == myData.tripe["Participate to an event"]){
                                         if(push == "true"){
                                            me.tripeUsersList.push(userinfo);
                                            push = "false";
                                        }
                                     }
                                 }
                                 if(push == "true"){
                                     for(var i = 0; i < myData.services.length; i++){
                                        if(myData.services[i].value){
                                             if(myData.services[i].value == userData.services[i].value){
                                                  me.tripeUsersList.push(userinfo);
                                                  push = "false";
                                             }
                                        }
                                     }
                                     if(push == "true"){
                                         for(var i = 0; i < myData.information.length; i++){
                                            if(myData.information[i].value){
                                                 if(myData.information[i].value == userData.information[i].value){
                                                      me.tripeUsersList.push(userinfo);
                                                      push = "false";
                                                 }
                                            }
                                         }   
                                     }
                                 }
                                 if(count == groupMemberCount){
                                     me.hideMe = true;
                                 }
                            }
                              
                         });
                 
                   }
                      push = "true";
                 }
                 /*console.log("me.tripeUsersList.length",me.tripeUsersList.length);
                 if(me.tripeUsersList.length != 0){
                             me.hideMe = true;
                             var user = JSON.parse(localStorage.getItem("loginUser"));
                             var userId = user.uid;
                             firebase.database().ref('users/' + userId).on('value', function (snapshot) {
                                for(var i in snapshot.val().tripe){
                                    if(snapshot.val().tripe[i] == true){
                                        var option ={
                                            option: i
                                        };
                                        me.trepOption.push(option);
                                    }
                                }
                            });
                             me.usersListLength = me.tripeUsersList.length;
                 }*/
             });
        });

    }

    /*loadListFromStorage() {
        var me = this;
        var user = firebase.auth().currentUser;
        var myuserlist = new Array();
        me.sqlDb.executeSql('select * from friendsList where userId = ?', [user.uid]).then((data) => {
            if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {

                    me._zone.run(() => {
                        myuserlist.push(data.rows.item(i));

                    })
                }
                // me.usersList = [];
                myuserlist.sort(me.sortUserRequest);
                me.usersList = myuserlist;

            }
        }, (err) => {
            alert('Unable to find data in friendslist: ' + JSON.stringify(err));
        });
    }*/

    strip(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }
    LoadList() {
        var me = this;
        var GrouplastDate;

        var groupInfo = JSON.parse(localStorage.getItem("Group"));
        var userId = localStorage.getItem("userId");
        firebase.database().ref('GroupMember/' + groupInfo.groupId+ '/' + userId).on("value",function(user){
            me.groupData = [];
            var userInfo = user.val();
            GrouplastDate = me.getLastDate(userInfo.lastDate);
            firebase.database().ref('Group/'+ groupInfo.key).on("value",function(groupData){
                var value = groupData.val();
                me.groupData = [];
                var groupDetail = {
                    groupId : value.groupId,
                    groupName : value.groupName,
                    unreadCount : userInfo.unreadCount,
                    lastMessage : userInfo.lastMessage,
                    lastDate : GrouplastDate
                };
                me.groupData.push(groupDetail);
            });
        });
         /*firebase.database().ref('GroupMember').on('value', function (snapshot) {
            var groupData  = snapshot.val();
            for (var data in groupData ) {
                for(var dataMember in groupData[data]){
                    if(user.uid == dataMember){
                        firebase.database().ref('Group/').orderByChild("groupId").equalTo(data).on('value', function (group) {
                            var value = group.val();
                            for (var i in value ) {
                                var mylastDate = me.getLastDate(groupData[data][dataMember].lastDate);
                                var groupDetail = {
                                    groupId : value[i].groupId,
                                    groupName : value[i].groupName,
                                    unreadCount : groupData[data][dataMember].unreadCount,
                                    lastMessage : groupData[data][dataMember].lastMessage,
                                    lastDate : mylastDate
                                };
                                me.groupData.push(groupDetail);
                            }
                        });
                    }
                }
            }
        });*/

        /* firebase.database().ref('Friends/' + user.uid).off();
        firebase.database().ref('Friends/' + user.uid).on('value', function (snapshot) {
            var fa = snapshot.exists();  // true

            if (fa == true) {
                me.hide = false;
                snapshot.forEach(function (snapshot) {
                    var request = snapshot.val();
                    var usersRef = firebase.database().ref('users');
                    var lastMessage = me.strip(request.lastMessage);
                    lastMessage = lastMessage.replace("'","''");
                    if (lastMessage.length > 25) {
                        lastMessage = lastMessage.substring(0, 25) + "...";
                    }
                    var mylastDate = me.getLastDate(request.lastDate);

                    usersRef.child(request.SenderId).once('value', function (snap) {
                        var users = snap.val();
                        var profilePic = users ? ((users.profilePic == "") ? 'assets/image/profile.png' : users.profilePic) : 'assets/image/profile.png';

                        var userinfo = {
                            name: users.name,
                            profilePic: profilePic,
                            email: users.email,
                            date: mylastDate,
                            lastDate: request.lastDate,
                            senderId: request.SenderId,
                            userId: user.uid,
                            key: snapshot.key,
                            unreadMessage: parseInt(request.unreadCount),
                            lastMessage: lastMessage,
                            block: parseInt(request.block),
                            RegId: users.pushToken,
                            access_code: users.access_code,
                            gender: users.gender,
                            status: users.status
                        };
                 me.usersList.push(userinfo); */
             /* me.sqlDb.executeSql('select * from friendsList where senderId = ?', [request.SenderId]).then((data) => {
                            if (data.rows.length > 0) {

                                if (data.rows.item(0).key == userinfo.key) {
                                    if (data.rows.item(0).name != userinfo.name || data.rows.item(0).profileImageUrl != userinfo.profilePic || data.rows.item(0).date != userinfo.date || data.rows.item(0).lastDate != userinfo.lastDate || data.rows.item(0).unreadMessage != userinfo.unreadMessage || data.rows.item(0).lastMessage != userinfo.lastMessage || data.rows.item(0).block != userinfo.block) {
                                        if (data.rows.item(0).profileImageUrl != userinfo.profilePic) {
                                            me.CommonProvider.toDataUrl(userinfo.profilePic, function (myBase64) {
                                                me.sqlDb.executeSql("UPDATE friendsList  SET name=?, profilePic=?,  email=?, date=?, lastDate=?, senderId=?, userId=?, key=?, access_code=?, gender=?, status=?, profileImageUrl=?, unreadMessage=?,lastMessage=?, block=?, RegId=? WHERE key=?", [userinfo.name, myBase64, userinfo.email, userinfo.date, userinfo.lastDate, userinfo.senderId, userinfo.userId, userinfo.key, userinfo.access_code, userinfo.gender, userinfo.status, userinfo.profilePic, userinfo.unreadMessage, userinfo.lastMessage, userinfo.block, userinfo.RegId, userinfo.key]).then(() => {
                                                    me.loadListFromStorage();
                                                })
                                                    .catch(e => alert('Unable to update sql: ' + JSON.stringify(e)));
                                            });
                                        } else {
                                            me.sqlDb.executeSql("UPDATE friendsList  SET name=?,   email=?, date=?, lastDate=?, senderId=?, userId=?, key=?, access_code=?, gender=?, status=?,profileImageUrl=?, unreadMessage=?,lastMessage=?, block=?, RegId=? WHERE key=?", [userinfo.name, userinfo.email, userinfo.date, userinfo.lastDate, userinfo.senderId, userinfo.userId, userinfo.key, userinfo.access_code, userinfo.gender, userinfo.status, userinfo.profilePic, userinfo.unreadMessage, userinfo.lastMessage, userinfo.block, userinfo.RegId, userinfo.key]).then(() => {
                                                me.loadListFromStorage();
                                            })
                                                .catch(e => alert('Unable to update sql: ' + JSON.stringify(e)));
                                        }

                                    }
                                }
                            } else {
                                me.CommonProvider.toDataUrl(userinfo.profilePic, function (myBase64) {
                                    me.sqlDb.executeSql("INSERT INTO friendsList(name,profilePic,email,date,lastDate,senderId,userId,key,access_code,gender,status,profileImageUrl,unreadMessage,lastMessage,block,RegId) VALUES('" + userinfo.name + "','" + myBase64 + "','" + userinfo.email + "','" + userinfo.date + "','" + userinfo.lastDate + "','" + userinfo.senderId + "','" + userinfo.userId + "','" + userinfo.key + "','" + userinfo.access_code + "','" + userinfo.gender + "','" + userinfo.status + "','" + userinfo.profilePic + "'," + userinfo.unreadMessage + ",'" + userinfo.lastMessage + "'," + userinfo.block + ",'" + userinfo.RegId + "')", [])
                                        .then(() => {
                                            me.loadListFromStorage();
                                        })
                                        .catch(e => alert('Unable to insert sql: ' + JSON.stringify(e)));
                                });
                            }
                        }, (err) => {
                            alert('Unable to select sql: ' + JSON.stringify(err));
                        });*/




                   /*  })

                });
            } else {
                me.hide = true;
                me.msg = Message.NOFRIEND_MSG;
            }

        }); */
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
    messageBox($event, item) {
        this.navCtrl.push("ChatPage", item);
    }
    groupMessageBox(item){
        var me = this;
        var groupData = JSON.parse(localStorage.getItem("Group"));
        firebase.database().ref('Group/' + groupData.key).on('value', function(group){
            var msg = me.tripeDateValidation(group.val().tripeDate,group.val().startTime,group.val().endTime);
            if(msg == ""){
                me.navCtrl.push("GroupChatPage",item);
            }else{
                let alert = me.alertCtrl.create({ subTitle: msg, buttons: ['OK'] });
                  alert.present();
            }
        });
    }

    tripeDateValidation(ripeDate,startDate,endDate){
        var msg = "";
        var convertDate = ripeDate.split("-");
        var start = startDate.split(":");
        var end = endDate.split(":");
        var date = new Date();
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var todayDate = dateCreated.split(" ");
        var todayConvertDate = todayDate[0].split("-");
        var todayConvertTime = todayDate[1].split(":");
        var groupInfo = JSON.parse(localStorage.getItem("Group"));
        if(groupInfo.type == "Train"){
            if(convertDate[0] != todayConvertDate[0] || convertDate[1] != todayConvertDate[1] || convertDate[2] != todayConvertDate[2]){
             var st1 = parseInt(start[0]) - 2
            msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
            return msg;
            }else{
                if(parseInt(start[0]) - 2 <= parseInt(todayConvertTime[0])){
                    if(parseInt(start[0]) - 2 == parseInt(todayConvertTime[0])){
                        if(parseInt(start[1]) <= parseInt(todayConvertTime[1])){
                            if(parseInt(end[0]) >= parseInt(todayConvertTime[0])){
                               if(parseInt(end[0]) == parseInt(todayConvertTime[0])){
                                   if(parseInt(end[1]) >= parseInt(todayConvertTime[1])){
                                       msg = "";
                                      return msg;
                                   }else{
                                       msg = "This group chat is end at " + ripeDate + " " + endDate;
                                        return msg;
                                   }
                               }else{
                                  msg = "";
                                  return msg; 
                               }
                            }else{
                                msg = "This group chat is end at " + ripeDate + " " + endDate;
                                return msg;
                            }

                        }else{
                            var st = parseInt(start[0]) - 2
                            msg = "This group chat not start yet. It's start at " + ripeDate + " " + st + ":" + start[1];
                            return msg;
                        }
                    }else{
                        msg = "";
                        return msg;
                    }
                }else{
                    var st = parseInt(start[0]) - 2
                        msg = "This group chat not start yet. It's start at " + ripeDate + " " + st + ":" + start[1];
                        return msg;
                }
            }
        }else{
             if(convertDate[0] != todayConvertDate[0] || convertDate[1] != todayConvertDate[1] || convertDate[2] != todayConvertDate[2]){
             var st1 = parseInt(start[0]) - 4
            msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
            return msg;
            }else{
                if(parseInt(start[0]) - 4 <= parseInt(todayConvertTime[0])){
                    if(parseInt(start[0]) - 4 == parseInt(todayConvertTime[0])){
                        if(parseInt(start[1]) <= parseInt(todayConvertTime[1])){
                            if(parseInt(end[0]) >= parseInt(todayConvertTime[0])){
                               if(parseInt(end[0]) == parseInt(todayConvertTime[0])){
                                   if(parseInt(end[1]) >= parseInt(todayConvertTime[1])){
                                       msg = "";
                                      return msg;
                                   }else{
                                       msg = "This group chat is end at " + ripeDate + " " + endDate;
                                        return msg;
                                   }
                               }else{
                                  msg = "";
                                  return msg; 
                               }
                            }else{
                                msg = "This group chat is end at " + ripeDate + " " + endDate;
                                return msg;
                            }

                        }else{
                            var st = parseInt(start[0]) - 4
                            msg = "This group chat not start yet. It's start at " + ripeDate + " " + st + ":" + start[1];
                            return msg;
                        }
                    }else{
                        msg = "";
                        return msg;
                    }
                }else{
                    var st = parseInt(start[0]) - 4
                        msg = "This group chat not start yet. It's start at " + ripeDate + " " + st + ":" + start[1];
                        return msg;
                }
            }
        }
    }


    sortUserRequest(x, y) {
        var a = new Date(x.lastDate);
        var b = new Date(y.lastDate);

        if (a === b) {
            return 0;
        }
        else {
            return (a > b) ? -1 : 1;
        }
    }

    imageTap(src) {
        let modal = this.modalCtrl.create("ImagePopupPage", { imageSrc: src });
        modal.present();
    
      }
    joinGroup(){
        
    }

}
