import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { global } from '../global/global';
import { TranslateService } from '@ngx-translate/core';
//import * as Message from '../../providers/message/message';
declare var firebase;

@IonicPage()

@Component({
   selector: 'ChatRoomMembers',
    template: `
    <ion-header>
        <ion-toolbar color="light" class="chat-room">
            <ion-row>
                <ion-icon name="arrow-back" (click)="goTo()"></ion-icon>
                <ion-title  class="title">{{ 'Chat room members' | translate }}</ion-title>
            </ion-row>       
        </ion-toolbar>
    </ion-header>
    <ion-content>
        
        <div class="image">
            <div *ngFor="let item of groupList">
                <div *ngIf="item.profilePic != 'assets/image/profile.png'" class="image-profile"> 
                    <img class="imgstyle" src='{{item.profilePic}}' (click)="showProfile(item)">
                </div>
                <div *ngIf="item.profilePic == 'assets/image/profile.png'" class="text-ige"> 
                    <span class="imgstyle1" (click)="showProfile(item)">{{item.slice}}</span>
                </div>
                <div class="image-profile">   
                    <img class="imgstyle hideimage" src='{{item.profilePic}}' >
                </div>
            </div>
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

    constructor(public translate: TranslateService,public CommonProvider: CommonProvider, private network: Network, public menu: MenuController, public sqlite: SQLite, public _zone: NgZone, public navCtrl: NavController, public navParams: NavParams/*,private storage: Storage*/) {
        var me = this;
        me.menu.swipeEnable(true);
        var user = JSON.parse(localStorage.getItem("loginUser"));

        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
        if(global.backPage == "ChatRoomMembers"){
            global.backPage = "FriendlistPage";
        }
    }

    ionViewDidLoad() {
        var data = JSON.parse(localStorage.getItem("Group"));
        this.getChatMemberData(data.groupId);
    }
    ionViewDidEnter() {
        
    }
    goTo(){
        this.navCtrl.setRoot("FriendlistPage");
    }
    goToFriendPage(){
         this.navCtrl.push(global.backPage);
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
                                slice: value.name.slice(0,2),
                                name : value.name,
                                access_code:value.access_code,
                                profilePic : profilePic,
                                status : value.status,
                                senderId: me.groupMemberKey[me.count],
                                block: 0,
                                age: value.age,
                                gender: value.gender
                            };

                            me.groupList.push(groupDetail);
                            me.count++;
                    });  
                    setTimeout(() => {
                      
                    }, 500);  
            }
         });
        
    }
    showProfile(item) {
        global.backPage = "ChatRoomMembers";
        this.navCtrl.push("ShowProfilePage", item);
    }
}
