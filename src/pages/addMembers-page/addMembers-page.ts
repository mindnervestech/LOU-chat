import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import * as Message from '../../providers/message/message';
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
            <ion-title  class="title">Add Members</ion-title>
        </ion-navbar>
    </ion-header>
     <ion-content>
     <div>
         <ion-input type="text" name="group_name" placeholder="Enter group name" [(ngModel)]="group_name"></ion-input>
     </div>
     <div>
         <ion-input type="text" name="train_number" placeholder="Enter train number name" [(ngModel)]="train_number"></ion-input>
     </div>
     <div>
         <ion-input type="text" name="start_time" placeholder="Enter train start time" [(ngModel)]="start_time"></ion-input>
     </div>
     <div>
         <ion-input type="text" name="end_time" placeholder="Enter train end time" [(ngModel)]="end_time"></ion-input>
     </div>
     <div>
         <ion-input type="text" name="date" placeholder="Enter train start date" [(ngModel)]="train_date"></ion-input>
     </div>
        <!-- <div>
            <ion-list [virtualScroll]="usersList" [approxItemHeight]="'70px'" >
            <ion-item *virtualItem="let item" (click)='messageBox($event,item)' tappable>
                <ion-avatar item-left>
                    <ion-img class="imgstyle" src='{{item.profilePic}}' ></ion-img>
                </ion-avatar>                
                <h2 *ngIf="item.name" >{{ item.name }} </h2>
                <h2 *ngIf="!item.name">{{ item.email }} </h2>             
            </ion-item>          
        </ion-list>      
        </div> -->
        <div>
            <button ion-button icon-only (click)="createGroup()">
                Create Group
            </button>
        </div>
    </ion-content>
    `,
})

export class AddMembersPage {
    usersList: any = new Array();
    msg: any;
    hide: boolean = false;
    group_name: string = "";
    train_number: string = "";
    start_time: string = "";
    end_time: string = "";
    train_date: string = "";
    usersData: any = new Array();
    sqlDb: SQLiteObject;

    constructor(public CommonProvider: CommonProvider, private network: Network, public menu: MenuController, public sqlite: SQLite, public _zone: NgZone, public navCtrl: NavController, public navParams: NavParams/*,private storage: Storage*/) {
        var me = this;
        me.menu.swipeEnable(true);
        var user = JSON.parse(localStorage.getItem("loginUser"));
        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
    }

    ionViewDidLoad() {
        console.log("ionViewDidLoad");
    }
    ionViewDidEnter() {
        console.log("ionViewDidEnter");
        //this.findMember();
    }
    goToFriendPage(){
         this.navCtrl.setRoot("FriendlistPage");
    }
    findMember(){
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var me = this;
        firebase.database().ref('Friends/' + user.uid).off();
        firebase.database().ref('Friends/' + user.uid).on('value', function (snapshot) {
            var fa = snapshot.exists();  // true

            if (fa == true) {
                me.hide = false;
                snapshot.forEach(function (snapshot) {
                    var request = snapshot.val();
                    var usersRef = firebase.database().ref('users');
                    
                    usersRef.child(request.SenderId).once('value', function (snap) {
                        var users = snap.val();
                        var profilePic = users ? ((users.profilePic == "") ? 'assets/image/profile.png' : users.profilePic) : 'assets/image/profile.png';

                        var userinfo = {
                            name: users.name,
                            profilePic: profilePic,
                            email: users.email,
                            senderId: request.SenderId,
                            userId: user.uid,
                            key: snapshot.key,
                            block: parseInt(request.block),
                            RegId: users.pushToken,
                            access_code: users.access_code
                        };
                 me.usersList.push(userinfo);
  
                    })

                });
            } else {
                me.hide = true;
                me.msg = Message.NOFRIEND_MSG;
            }

        });

         firebase.database().ref('users/'+ user.uid).once('value', function (snap) {
             var data = snap.val();
             me.usersData.push(data);
             console.log("data",data);
        });
    }

    createGroup(){
        var user = JSON.parse(localStorage.getItem("loginUser"));
         console.log("usersData",this.usersData);
        var group_id = this.CommonProvider.createGroupId();
        var date = new Date();
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(dateCreated);
        firebase.database().ref().child('Group/').push({
            DateCreated: dateCreated,
            groupId: group_id,
            groupName: this.group_name,
            trainNumber : this.train_number,
            startTime: this.start_time,
            endTime: this.end_time,
            trainDate : this.train_date
          }).then(()=>{
              /*console.log("add member");
              firebase.database().ref().child('GroupMember/'+ group_id + '/' + user.uid).set({
                groupId : group_id,
                DateCreated: dateCreated,
                userId : this.usersData[0].access_code,
                lastDate : dateCreated,
                unreadCount : 0,
                lastMessage: ''
              });
              for (var i = 0 ; i < this.usersList.length; i++) {
                     console.log(this.usersList); 
                     firebase.database().ref().child('GroupMember/'+ group_id + '/' + this.usersList[i].key).set({
                          groupId : group_id,
                          DateCreated: dateCreated,
                          userId : this.usersList[i].access_code,
                          lastDate : dateCreated,
                          unreadCount : 0,
                          lastMessage: ''
                      });
              }*/
              this.goToFriendPage();
              
        });
    }
}
