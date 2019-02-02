import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, AlertController,ViewController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import * as Message from '../../providers/message/message';
declare var firebase;
@IonicPage()

@Component({
   selector: 'page-friendlist',
   //templateUrl: 'friendlist-page.html',
    template: `
   <ion-header>
        <ion-navbar>
            <button ion-button menuToggle>
                <ion-icon name='menu'></ion-icon>
            </button>
        </ion-navbar>
    </ion-header>
    <ion-content class="friendlist-page-content">
        <div class="modal_content" id="modal_content" *ngIf="hideMe">
            <div class="div_main">
                <ion-row class="ion_row_atmosphere_margin">
                    <img class="img_arrow_down_n" src="{{profilePic}}">
                </ion-row>
                <ion-row class="ion_row_sub_margin">
                    <h2 class="subheading_content">You have match with {{usersListLength}} member</h2>
                    <p class="common-topic">Your common topic:</p>
                    <div *ngFor="let data of trepOption">
                        <p class="common-topic">- {{data.option}}</p>
                    </div>
                </ion-row>
                <div class="div_bottom">
                    <ion-row justify-content-center align-items-center class="ion_row_heiht_bottam">
                        <button class="dismiss" (click)='dismiss_dialog()' style="position:absolute;left: 0;">Dismiss</button>
                        <button class="dismiss" (click)='addToChat()' style="position:absolute;right: 0;">Add to chat list</button>
                    </ion-row>
                </div>
            </div>
        </div>
        <ion-list [virtualScroll]="groupData" [approxItemHeight]="'70px'" >
            <ion-item *virtualItem="let data" tappable>
                <ion-avatar item-left class="ion-pro">
                    <ion-img class="imgstyle" src='./assets/image/group.png' (click)="gotToChatRoomMembersPage(data.groupId)"></ion-img>
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
                <ion-avatar item-left>
                    <ion-img class="imgstyle" src='{{item.profilePic}}'></ion-img>
                </ion-avatar>                
                <h2 *ngIf="item.name" >{{ item.name }} </h2>
                <h2 *ngIf="!item.name">{{ item.email }} </h2>
                
                <p>{{ item.lastMessage }} </p>
                <div item-right>
                <span class="mytime" >{{ item.date }}</span>
                <ion-badge style="float: right;" *ngIf="item.unreadMessage">{{ item.unreadMessage }}</ion-badge>  
                </div>             
            </ion-item>          
        </ion-list>
    </ion-content>
    `,
})

export class FriendlistPage {
    usersList: any = new Array();
    usersListLength: any = Number;
    groupData: any = new Array();
    tripeUsersList: any = new Array();
    trepOption: any = new Array();
    msg: any;
    hide: boolean = false;
    hideMe: boolean = false;
    sqlDb: SQLiteObject;
    profilePic: string = "";
    constructor(public viewCtrl: ViewController,public alertCtrl: AlertController, public CommonProvider: CommonProvider, private network: Network, public menu: MenuController, public sqlite: SQLite, public _zone: NgZone, public navCtrl: NavController, public navParams: NavParams/*,private storage: Storage*/) {
        var me = this;
        me.menu.swipeEnable(true);
        //var user = firebase.auth().currentUser;
        var user = JSON.parse(localStorage.getItem("loginUser"));
        this.profilePic = (user.profilePic == "") ? 'assets/image/profile.png' : user.profilePic; 
        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
    }

    ionViewDidLoad() {
        var me = this;

       /* this.sqlite.create({
            name: 'data.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                me.sqlDb = db;
                //me.LoadList();
            });*/
             var popup = localStorage.getItem("popUp");
                me.match();
            me.LoadList();
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
        this.navCtrl.setRoot("ChatRoomMembers",item);
    }

    dismiss_dialog(){
        this.hideMe = false;
        localStorage.setItem("popUp","true");
    }
    addToChat(){
        this.hideMe = false;
        localStorage.setItem("popUp","true");
        this.usersList = this.tripeUsersList; 
    }

    match(){
        var userID = localStorage.getItem("userId");
        var me = this;
        firebase.database().ref('users/'+ userID).on('value',function(user){
            var myData = user.val();
            var push = "true";
            var date = new Date();
            var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            var mylastDate = me.getLastDate(dateCreated);
             firebase.database().ref('users/').on('value',function(Alluser){
                 var userData = Alluser.val();

                 me.tripeUsersList = [];
                 for(var data in userData){
                     if(data != userID){
                         var userinfo = {
                            name: userData[data].name,
                            profilePic: userData[data].profilePic ? userData[data].profilePic : "assets/image/profile.png",
                            age: userData[data].age,
                            lastDate: mylastDate,
                            unreadMessage: 0,
                            userId: data,
                            lastMessage: "",
                            date: mylastDate,
                            senderId : data
                         };

                         if(myData.tripe["Home Work Trip"]){
                             if(userData[data].tripe.HomeWork == myData.tripe.HomeWork){
                                 me.tripeUsersList.push(userinfo);
                                 push = "false";
                             }
                         }
                         if(myData.tripe.Tourism){
                             if(userData[data].tripe.Tourism == myData.tripe.Tourism){
                                if(push == "true"){
                                    me.tripeUsersList.push(userinfo);
                                    push = "false";
                                }
                             }
                         }
                         if(myData.tripe.Business){
                             if(userData[data].tripe.Business == myData.tripe.Business){
                                 if(push == "true"){
                                    me.tripeUsersList.push(userinfo);
                                    push = "false";
                                }
                             }
                         }
                         if(myData.tripe["To Visit People"]){
                             if(userData[data].tripe.VisitPeople == myData.tripe.VisitPeople){
                                 if(push == "true"){
                                    me.tripeUsersList.push(userinfo);
                                    push = "false";
                                }
                             }
                         }
                     }
                     push = "true";
                 }
                 if(me.tripeUsersList.length != 0){
                     var popup = localStorage.getItem("popUp");
                     if(popup == "true"){
                         me.usersList = me.tripeUsersList; 
                     }else{
                         me.hideMe = true;
                         var user = JSON.parse(localStorage.getItem("loginUser"));
                         var userId = user.uid;
                         firebase.database().ref('users/' + userId).on('value', function (snapshot) {
                            for(var i in snapshot.val().tripe){
                                if(snapshot.val().tripe[i]){
                                    var option ={
                                        option: i
                                    };
                                    me.trepOption.push(option);
                                }
                            }
                        });
                         me.usersListLength = me.tripeUsersList.length;
                     }
                 }
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
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var me = this;
        me.usersList = [];
       
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
        var groupData = JSON.parse(localStorage.getItem("Group"));
        var msg = this.tripeDateValidation(groupData.tripeDate,groupData.startTime,groupData.endTime);
        if(msg == ""){
            this.navCtrl.setRoot("GroupChatPage",item);
        }else{
            let alert = this.alertCtrl.create({ subTitle: msg, buttons: ['OK'] });
              alert.present();
        }
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

    
    joinGroup(){
        
    }

}
