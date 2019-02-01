import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { global } from '../global/global';
import { Network } from '@ionic-native/network';
import { PushProvider } from '../../providers/push/push';
declare var firebase;
import { LoadingProvider } from '../../providers/loading/loading';
import { CommonProvider } from '../../providers/common/common';
import * as Message from '../../providers/message/message';
@IonicPage()

@Component({
     selector: 'page-newrequest',
    template: `
    <ion-header>
        <ion-navbar>
            <button ion-button menuToggle>
                <ion-icon name='menu'></ion-icon>
            </button>
            <ion-title  class="title">Pending Request</ion-title>
        </ion-navbar>
    </ion-header>

    <ion-content class="newrequest-page-content">
        <div *ngIf="hide">
            <h4 style="color:#ccc" padding text-center>{{msg}}</h4>
        </div>

        <ion-list [virtualScroll]="usersList" [approxItemHeight]="'70px'" >
            <ion-item-sliding *virtualItem="let item">
                <ion-item (click)="presentAllowDeny(item)" tappable>
                    <ion-avatar item-left>
                        <ion-img class="imgstyle" src='{{item.profilePic}}' ></ion-img>
                    </ion-avatar>
                    <h2 *ngIf="item.name">{{ item.name }}</h2>
                    <h2 *ngIf="!item.name">{{ item.email }}</h2>
                    <p>{{ item.date}}</p>                  
                </ion-item>
                         
                <ion-item-options side='right'>
                    <button ion-button color='secondary' small (click)='accept(item)' tappable>
                        Allow
                    </button>
                    <button ion-button color='danger' small (click)='reject(item)' tappable>
                        Deny
                    </button>
                </ion-item-options>
            </ion-item-sliding>

        </ion-list>
    </ion-content>
    `,
})

export class NewrequestPage {
    values: any[];
    sender: any;
    time: any;
    receiverid: any;
    key: any;
    listData: any;
    msg: any;
    hide: boolean = false;
    usersList: any = new Array();
    constructor(public CommonProvider: CommonProvider, public LoadingProvider: LoadingProvider, public toastCtrl: ToastController, private network: Network, public _zone: NgZone, public PushProvider: PushProvider, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public actsheetCtrl: ActionSheetController) {

       var user = JSON.parse(localStorage.getItem("loginUser"));
        var me = this; 
        if (!user) {
            me.navCtrl.setRoot("OptionPage");
        }
    }
    ionViewDidLoad() {
        console.log("in new request page");
        /* when user comes to this view this function will load. here is the show all PendingRequest for currentUser. it will show all the request till user accept or reject.
        the data will load from firebase pending request table. */
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var me = this;
        //off() function all callbacks for the reference will be removed.
        firebase.database().ref('PendingRequest/' + user.uid).off();
        firebase.database().ref('PendingRequest/' + user.uid).on('value', function (snapshot) {
            me.LoadingProvider.startLoading();
            me.usersList = [];
            var fa = snapshot.exists();  // true
            if (fa == true) {
                snapshot.forEach(function (snapshot) {
                    me.hide = false;
                    me.msg = "";
                    var request = snapshot.val();
                    var usersRef = firebase.database().ref('users');
                    usersRef.child(request.SenderId).once('value', function (snap) {
                        var convertDate = request.DateCreated.split(" ");
                        var dateValue = convertDate[0].split("-");
                        var timeValue = convertDate[1].split(":");
                        var lastDate = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], timeValue[0], timeValue[1], timeValue[2], 0);
                        var time = me.CommonProvider.formatAMPM(lastDate);
                        var users = snap.val();
                        me._zone.run(() => {
                            var userinfo = {
                                profilePic: users ? ((users.profilePic == "") ? 'assets/image/profile.png' : users.profilePic) : 'assets/image/profile.png',
                                name: users.name,
                                email: users.email,
                                date: lastDate.toLocaleDateString() + " " + time,
                                senderId: request.SenderId,
                                userId: user.uid,
                                key: snapshot.key
                            };
                            me.usersList.push(userinfo);
                            console.log("me.usersList",me.usersList);
                        })
                    });
                });
            }
            else {
                me.hide = true;
                me.msg = "There is no new request for you";
            }
            me.LoadingProvider.closeLoading();
        });
    }
    reject(item) {
        /* this function will call when user slide to list and tap reject button. this is used for rejecting their request to individual requester.if
           user tap to reject it will delete from firebase PendingRequest table and also remove from the pending request view. */
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
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        var userEmail = firebase.auth().currentUser.email;
        var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
        firebase.database().ref('PendingRequest/' + userId + "/" + item.key).remove().then(function () {
           
            let alert = me.alertCtrl.create({
                title: 'Rejected',
                subTitle: Message.FRIEND_REQUEST_REJECT_SUCCESS + item.email,
                buttons: ['OK']
            });
            alert.present();
            // send notification
            var title = "Reject Request";
            var body = Message.PUSH_REJECT_REQUEST + senderName;

            me.PushProvider.PushNotification(item.RegId, title, body);
        });
    }
    accept(item) {
        /* this function will call when user slide to list and tap accept button. this is used for accepting their request to individual requester.if
           user tap to accept it will delete from firebase PendingRequest table and also add to friend table and remove from the pending request view. */
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
        var date = new Date();
        var user = JSON.parse(localStorage.getItem("loginUser"));
        var userId = user.uid;
        var userEmail = user.email;
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
        firebase.database().ref('Friends/' + userId).once('value').then(function (snapshot) {
            var a = 0;  // true
            snapshot.forEach(function (snapshot) {
                if (snapshot.val().SenderId == item.senderId) {
                    a = 1;
                }
            });

            if (a == 0) {
                firebase.database().ref().child('Friends/' + userId + '/' + item.senderId).set({
                    DateCreated: dateCreated,
                    SenderId: item.senderId,
                    unreadCount: 0,
                    lastDate: dateCreated,
                    lastMessage: "",
                    block: 0
                }).then(function (snapshot) {
                    firebase.database().ref().child('Friends/' + item.senderId + '/' + userId).set({
                        DateCreated: dateCreated,
                        SenderId: userId,
                        unreadCount: 0,
                        lastDate: dateCreated,
                        lastMessage: "",
                        block: 0
                    }).then(function () {
                        firebase.database().ref('PendingRequest/' + userId + "/" + item.key).remove().then(function () {
                            let alert = me.alertCtrl.create({
                                title: 'Accepted',
                                subTitle: Message.FRIEND_REQUEST_ACCEPT_SUCCESS + item.email,
                                buttons: ['OK']
                            });
                            alert.present();
                            // send notification
                            var title = "Accept Request";
                            var body = "your have been connected with  " + senderName;

                            me.PushProvider.PushNotification(item.RegId, title, body);

                            //me.PushNotification(userId, item.RegId, true);
                        });
                    });
                });
            } else {
                let alert = me.alertCtrl.create({
                    title: 'Already Friends',
                    subTitle: Message.ALREADY_FRIENDS + item.email,
                    buttons: ['OK']
                });
                alert.present();
            }
        });


    }

    presentAllowDeny(s) {
        if (this.network.type == "none") {
            let toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        let actionSheet = this.actsheetCtrl.create({
            title: 'Friend Request',
            buttons: [
                {
                    text: 'Accept',
                    handler: () => {
                        this.accept(s);
                    }
                },
                {
                    text: 'Reject',
                    handler: () => {
                        this.reject(s);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

}
