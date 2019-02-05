import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { global } from '../global/global';
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
        
        <div class="image">
            <span *ngFor="let item of groupList">
           <img class="imgstyle" src='{{item.profilePic}}' (click)="showProfile(item)">
           <img class="imgstyle hideimage" src='{{item.profilePic}}' >
            </span>
        </div>
        
    </ion-content>
    `,
})

export class ChatRoomMembers {
    groupList: any = new Array();
    groupMemberKey: any = new Array();
    temp: any = new Array();
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
        this.getChatMemberData(this.navParams.data);
    }
    ionViewDidEnter() {
        
    }
    goToFriendPage(){
         this.navCtrl.setRoot("FriendlistPage");
    }
    getChatMemberData(groupId){
        var me = this;
         firebase.database().ref('GroupMember/'+ groupId).on('value', function (snapshot) {
              var groupData  = snapshot.val();
              me.groupList = [];
              for (var data in groupData ) {
                  me.groupMemberKey.push(data);
                    firebase.database().ref('users/'+ data).on('value', function (snap) {
                        var value = snap.val();
                            var profilePic = value ? ((value.profilePic == "") ? 'assets/image/profile.png' : value.profilePic) : 'assets/image/profile.png';
                            var groupDetail = {
                                name : value.name,
                                email : value.email,
                                access_code:value.access_code,
                                profilePic : profilePic,
                                status : value.status,
                                senderId: me.groupMemberKey[me.count],
                                block: 0,
                                age: value.age,
                                gender: value.gender
                            };

                            me.temp.push(groupDetail);
                            me.count++;
                    });  
                    setTimeout(() => {
                      
                    }, 500);  
            }
            me.groupList = me.temp;
            me.temp = [];
         });
        
    }
    showProfile(item) {
        global.backPage = "ChatRoomMembers";
        this.navCtrl.push("ShowProfilePage", item);
    }
}
