import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
//import * as Message from '../../providers/message/message';
declare var firebase;

@IonicPage()

@Component({
   selector: 'ChatRoomMembers',
    template: `
    <ion-header>
        <ion-navbar>
            <button ion-button icon-only class="back-btn" (click)="goToFriendPage()">
                <ion-icon name='arrow-back'></ion-icon>
            </button>
            <ion-title  class="title">Chat Room Members</ion-title>
        </ion-navbar>
    </ion-header>
    <ion-content>
        <ion-list [virtualScroll]="groupList" [approxItemHeight]="'70px'" >
            <ion-item *virtualItem="let item" (click)='showProfile(item)' tappable>
                <ion-avatar item-left>
                    <ion-img class="imgstyle" src='{{item.profilePic}}' ></ion-img>
                </ion-avatar>                
                <h2 *ngIf="item.name" >{{ item.name }} </h2>
                <h2 *ngIf="!item.name">{{ item.email }} </h2>
                <p>{{ item.status }} </p>            
            </ion-item>          
        </ion-list>
    </ion-content>
    `,
})

export class ChatRoomMembers {
    groupList: any = new Array();
    groupMemberKey: any = new Array();
    msg: any;
    hide: boolean = false;
    count = 0;
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
        console.log(this.navParams.data);
        this.getChatMemberData(this.navParams.data);
    }
    ionViewDidEnter() {
        console.log("ionViewDidEnter");
    }
    goToFriendPage(){
         this.navCtrl.setRoot("FriendlistPage");
    }
    getChatMemberData(groupId){
        var me = this;
         firebase.database().ref('GroupMember/'+ groupId).on('value', function (snapshot) {
              var groupData  = snapshot.val();
              for (var data in groupData ) {
                  console.log(data);
                  me.groupMemberKey.push(data);
                  console.log(me.groupMemberKey);
                    firebase.database().ref('users/'+ data).on('value', function (snap) {
                        var value = snap.val();
                        me.groupList = [];
                            var profilePic = value ? ((value.profilePic == "") ? 'assets/image/profile.png' : value.profilePic) : 'assets/image/profile.png';
                            var groupDetail = {
                                name : value.name,
                                email : value.email,
                                access_code:value.access_code,
                                profilePic : profilePic,
                                status : value.status,
                                senderId: me.groupMemberKey[me.count],
                                 block: 0,
                            };
                            me.groupList.push(groupDetail);
                            me.count++;
                        console.log("groupData",me.groupList);
                    });  
                    setTimeout(() => {
                      
                    }, 500);  
            }
         });
        
    }
    showProfile(item) {
        this.navCtrl.push("ShowProfilePage", item);
    }
}
