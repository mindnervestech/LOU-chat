var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, NgZone, HostListener, ElementRef } from '@angular/core';
import { Platform, Content, IonicPage, NavController, ModalController, NavParams, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { global } from '../global/global';
import { PushProvider } from '../../providers/push/push';
import { CommonProvider } from '../../providers/common/common';
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { LoadingProvider } from '../../providers/loading/loading';
import * as Message from '../../providers/message/message';
/**
 * Generated class for the ChatPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var ChatPage = /** @class */ (function () {
    function ChatPage(modalCtrl, camera, LoadingProvider, platform, CommonProvider, _DomSanitizer, toastCtrl, sqlite, network, PushProvider, element, actionSheetCtrl, navCtrl, _zone, navParams, alertCtrl) {
        this.modalCtrl = modalCtrl;
        this.camera = camera;
        this.LoadingProvider = LoadingProvider;
        this.platform = platform;
        this.CommonProvider = CommonProvider;
        this._DomSanitizer = _DomSanitizer;
        this.toastCtrl = toastCtrl;
        this.sqlite = sqlite;
        this.network = network;
        this.PushProvider = PushProvider;
        this.element = element;
        this.actionSheetCtrl = actionSheetCtrl;
        this.navCtrl = navCtrl;
        this._zone = _zone;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.message = "";
        this.senderUser = {};
        this.messagesList = [];
        this.lastKeyProcess = false;
        this.limit = 10;
        this.dynamicArr = [];
        this.isBusy = false;
        this.editmsg = false;
        this.hideStatus = true;
        this.ChatKeys = [];
        this.blockUser = 0;
        this.block2 = 0;
        this.block1 = 0;
        this.loadingmessageCounter = 0;
        var user = firebase.auth().currentUser;
        var me = this;
        if (!user) {
            me.navCtrl.setRoot("LoginPage");
        }
        global.Is_CHAT_PAGE = true;
    }
    ChatPage.prototype.onInput = function (textArea) {
        this.adjust();
    };
    ChatPage.prototype.setScroll = function () {
        if (this.content._scroll)
            this.content.scrollToBottom(280);
    };
    ChatPage.prototype.inputClick = function () {
        var me = this;
        var dimensions = me.content.getContentDimensions();
        if (dimensions.scrollHeight - (dimensions.scrollTop + dimensions.contentHeight) <= 300) {
            me.content.scrollTo(0, dimensions.scrollHeight);
        }
    };
    ChatPage.prototype.ionViewDidLoad = function () {
        //when user comes to this page this function will call.
        var me = this;
        var userId = firebase.auth().currentUser.uid;
        me.myuserid = userId;
        me.senderUser = me.navParams.data;
        var block1;
        block1 = me.senderUser.block;
        me.block1 = block1;
        me.friendkey = me.senderUser.key;
        firebase.database().ref('Friends/' + me.senderUser.senderId + '/' + userId).off();
        //it will call if you blocked someone or blocked by someone.
        firebase.database().ref('Friends/' + me.senderUser.senderId + '/' + userId).on('value', function (snapshot) {
            me.block2 = snapshot.val().block;
            if (me.block1 == 0 && me.block2 == 0) {
                me.blockUser = 0;
            }
            else if (me.block2 == 1) {
                me.blockMsg = Message.SHOW_OTHER_USER_BLOCK_MSG;
                me.blockUser = 1;
            }
            else if (me.block1 == 1) {
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
                .then(function (db) {
                me.sqlDb = db;
                var userId = localStorage.getItem("userId");
                db.executeSql('select * from chat where recieverId = ? and userId =?', [me.senderUser.senderId, userId]).then(function (data) {
                    if (data.rows.length > 0) {
                        for (var i = 0; i < data.rows.length; i++) {
                            me._zone.run(function () {
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
                }, function (err) {
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
                me._zone.run(function () { return me.messagesList.push({
                    'DateCreated': date.toLocaleDateString(),
                    'time': time,
                    'isRead': messages.val().isRead,
                    'message': messages.val().message,
                    'sender_id': messages.val().sender_id,
                    'mkey': messages.key,
                    "userId": me.myuserid,
                    "type": messages.val().type,
                }); });
                //insert message data in SQLite.
                me.sqlite.create({
                    name: 'data.db',
                    location: 'default'
                })
                    .then(function (db) {
                    me.sqlDb = db;
                    db.executeSql('select * from chat  where mkey = ?', [messages.key]).then(function (data) {
                        if (data.rows.length == 0) {
                            if (messages.val().type == "text") {
                                me.sqlDb.executeSql("insert into chat(DateCreated,time,isRead,message,sender_id,mkey,userId,recieverId,type) values(?,?,?,?,?,?,?,?,?)", [date.toLocaleDateString(), time, messages.val().isRead, messages.val().message, messages.val().sender_id, messages.key, me.myuserid, me.senderUser.senderId, messages.val().type]).then(function () {
                                })
                                    .catch(function (e) { return alert('Unable to insert sql: ' + JSON.stringify(e)); });
                            }
                            if (messages.val().type == "image") {
                                me.CommonProvider.toDataUrl(messages.val().message, function (myBase64) {
                                    me.sqlDb.executeSql("insert into chat(DateCreated,time,isRead,message,sender_id,mkey,userId,recieverId,type) values(?,?,?,?,?,?,?,?,?)", [date.toLocaleDateString(), time, messages.val().isRead, myBase64, messages.val().sender_id, messages.key, me.myuserid, me.senderUser.senderId, messages.val().type]).then(function () {
                                    })
                                        .catch(function (e) { return alert('Unable to insert sql: ' + JSON.stringify(e)); });
                                });
                            }
                        }
                    }, function (err) {
                        alert('Unable to select sql: ' + JSON.stringify(err));
                    });
                });
                if (me.loadingmessageCounter > 5) {
                    setTimeout(function () {
                        me.setScroll();
                    }, 500);
                }
            });
        }
    };
    ChatPage.prototype.readMessage = function () {
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
        setTimeout(function () {
            me.setScroll();
        }, 700);
    };
    ChatPage.prototype.adjust = function () {
        //  let ta = this.element.nativeElement.querySelector("textarea");
        var ta = document.getElementById('contentMessage');
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
    };
    ChatPage.prototype.ionViewDidEnter = function () {
        var me = this;
        me.sqlite.create({
            name: 'data.db',
            location: 'default'
        })
            .then(function (db) {
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
        var friendRef = firebase.database().ref('Friends/' + me.myuserid);
        friendRef.child(me.friendkey).update({
            unreadCount: 0
        });
    };
    ChatPage.prototype.ionViewWillLeave = function () {
        var me = this;
        var friendRef = firebase.database().ref('Friends/' + me.myuserid);
        console.log("inside ionview will leave");
        global.Is_CHAT_PAGE = false;
        //it is for unreadCount Message update in firebase if user leaves the chat page then the current user message will be update in firebase as unReadCount as 0;
        friendRef.child(me.friendkey).update({
            unreadCount: 0
        }).then(function () {
            console.log("updated view count to 0");
        });
    };
    ChatPage.prototype.sendMessage = function (type) {
        //it is for send Message, the current user can send message to connected user;
        var me = this;
        var date = new Date();
        //in case of network type none means no internet connection then user can not send message to other.
        if (me.network.type == "none") {
            var toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        var userId = firebase.auth().currentUser.uid;
        var userEmail = firebase.auth().currentUser.email;
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var senderName = (global.USER_NAME == "") ? userEmail : global.USER_NAME;
        if (this.message != "") {
            var lastDisplaymessage = this.message.replace(/\r?\n/g, '<br />');
            ;
            this.message = "";
            var ta = document.getElementById('contentMessage');
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
                        firebase.database().ref('Friends/' + me.senderUser.senderId + '/' + userId).once('value').then(function (snapshot) {
                            var friendRef = firebase.database().ref('Friends/' + me.senderUser.senderId);
                            friendRef.child(userId).update({
                                unreadCount: parseInt(snapshot.val().unreadCount) + 1,
                                lastDate: dateCreated,
                                lastMessage: lastDisplaymessage
                            }).then(function () {
                                console.log("Message send successfully");
                                var title = "You have new Msg from " + senderName;
                                var body = me.strip(lastDisplaymessage);
                                me.PushProvider.PushNotification(me.senderUser.RegId, title, body);
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
                });
            });
        }
    };
    ChatPage.prototype.strip = function (html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };
    ChatPage.prototype.myHeaderFn = function (record, recordIndex, records) {
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
    };
    ChatPage.prototype.showHeader = function (record, recordIndex) {
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
    };
    ChatPage.prototype.showProfile = function (user) {
        this.navCtrl.push("ShowProfilePage", user);
    };
    ChatPage.prototype.ngAfterViewInit = function () {
        //it will call when we tap to scroll on screen and the scroll top will show to previous message of chat. 
        var me = this;
        me.content.ionScroll.subscribe(function ($event) {
            if ($event.scrollTop < 1) {
                if (me.lastKeyProcess) {
                    me.show();
                    me.loadPreviousMsg().then(function (value) {
                        me.dynamicArr.pop();
                        if (me.dynamicArr.length == 0) {
                            me.lastKeyProcess = false;
                            me.hide();
                            return;
                        }
                        var lasScroll = me.messagesList[0];
                        me._zone.run(function () {
                            var demoArr = me.dynamicArr.reverse();
                            for (var i = 0; i < demoArr.length; i++) {
                                me.messagesList.unshift(me.dynamicArr[i]);
                            }
                        });
                        me.lastKeyProcess = true;
                        setTimeout(function () {
                            me.scrollToId('quote-' + lasScroll.mkey);
                        }, 100);
                    });
                }
            }
        });
    };
    ChatPage.prototype.scrollToId = function (element) {
        var elem = document.getElementById(element);
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
    };
    ChatPage.prototype.loadPreviousMsg = function () {
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
                me._zone.run(function () { return me.dynamicArr.push({
                    'DateCreated': date.toLocaleDateString(),
                    'time': time,
                    'isRead': messages.val().isRead,
                    'message': messages.val().message,
                    'sender_id': messages.val().sender_id,
                    'mkey': messages.key,
                    "userId": me.myuserid,
                    "type": messages.val().type
                }); });
            });
            return me.dynamicArr;
        });
    };
    ChatPage.prototype.show = function () {
        var _this = this;
        this._zone.run(function () {
            return _this.isBusy = true;
        });
    };
    ChatPage.prototype.hide = function () {
        var _this = this;
        this._zone.run(function () {
            return _this.isBusy = false;
        });
    };
    ChatPage.prototype.showFriendOptions = function (user) {
        var _this = this;
        //by this function the currentUser can view the profile of connected user. and user can block and unblock to the connected user.
        var me = this;
        if (me.network.type == "none") {
            var toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        if (me.block1 == 0) {
            var actionSheet = this.actionSheetCtrl.create({
                buttons: [
                    {
                        text: 'View Profile',
                        handler: function () {
                            _this.navCtrl.push("ShowProfilePage", user);
                        }
                    }, {
                        text: 'Block User',
                        handler: function () {
                            console.log('Block User');
                            var friendRef = firebase.database().ref('Friends/' + me.myuserid);
                            friendRef.child(me.friendkey).update({
                                block: 1
                            }).then(function () {
                                me.blockUser = 1;
                                me.block1 = 1;
                                me.blockMsg = Message.SHOW_BLOCK_MSG;
                                var alert = me.alertCtrl.create({
                                    title: 'User Blocked',
                                    subTitle: Message.USER_BLOCK_SUCCESS,
                                    buttons: ['OK']
                                });
                                alert.present();
                            });
                        }
                    }, {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: function () {
                            console.log('Cancel clicked');
                        }
                    }
                ]
            });
            actionSheet.present();
        }
        else if (me.block1 == 1) {
            var actionSheet = this.actionSheetCtrl.create({
                buttons: [
                    {
                        text: 'View Profile',
                        handler: function () {
                            _this.navCtrl.push("ShowProfilePage", user);
                        }
                    }, {
                        text: 'Unblock User',
                        handler: function () {
                            console.log('Unblock User');
                            var friendRef = firebase.database().ref('Friends/' + me.myuserid);
                            friendRef.child(me.friendkey).update({
                                block: 0
                            }).then(function () {
                                if (me.block2 == 0) {
                                    me.blockUser = 0;
                                    me.block1 = 0;
                                    var alert_1 = me.alertCtrl.create({
                                        title: 'User Unblocked',
                                        subTitle: Message.USER_UNBLOCK_SUCCESS,
                                        buttons: ['OK']
                                    });
                                    alert_1.present();
                                }
                                else if (me.block2 == 1) {
                                    me.blockUser = 1;
                                    me.block1 = 0;
                                    me.blockMsg = Message.SHOW_OTHER_USER_BLOCK_MSG;
                                    var alert_2 = me.alertCtrl.create({
                                        title: 'User Unblocked',
                                        subTitle: Message.USER_BLOCK_BY_OTHERUSER,
                                        buttons: ['OK']
                                    });
                                    alert_2.present();
                                }
                            });
                        }
                    }, {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: function () {
                            console.log('Cancel clicked');
                        }
                    }
                ]
            });
            actionSheet.present();
        }
    };
    ChatPage.prototype.presentActionSheet = function () {
        var me = this;
        var me = this;
        if (me.network.type == "none") {
            var toast = this.toastCtrl.create({
                message: 'No internet connection.',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return true;
        }
        else {
            var actionSheet = me.actionSheetCtrl.create({
                title: 'Sending Image Options',
                cssClass: 'action-sheets-basic-page',
                buttons: [
                    {
                        text: 'Camera',
                        icon: !me.platform.is('ios') ? 'camera' : null,
                        handler: function () {
                            me.cameraUpload();
                        }
                    },
                    {
                        text: 'Gallery',
                        icon: !me.platform.is('ios') ? 'image' : null,
                        handler: function () {
                            me.gallaryUpload();
                        }
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        icon: !me.platform.is('ios') ? 'close' : null,
                        handler: function () {
                            console.log('Cancel clicked');
                        }
                    }
                ]
            });
            actionSheet.present();
        }
    };
    ChatPage.prototype.gallaryUpload = function () {
        var filename = Math.floor(Date.now() / 1000);
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
        }).then(function (imageData) {
            var uploadTask = firebase.storage().ref().child(filename + ".jpg").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                me.LoadingProvider.startLoading();
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.message = downloadFlyerURL;
                me.sendMessage("image");
                setTimeout(function () {
                    me.LoadingProvider.closeLoading();
                }, 200);
            });
        }, function (err) {
            console.log(err);
        });
    };
    ChatPage.prototype.cameraUpload = function () {
        var filename = Math.floor(Date.now() / 1000);
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
        }).then(function (imageData) {
            me.LoadingProvider.startLoading();
            var uploadTask = firebase.storage().ref().child(filename + ".jpg").putString(imageData, "base64");
            uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
                alert(error);
            }, function () {
                var downloadFlyerURL = uploadTask.snapshot.downloadURL;
                me.message = downloadFlyerURL;
                me.sendMessage("image");
                setTimeout(function () {
                    me.LoadingProvider.closeLoading();
                }, 200);
            });
        }, function (err) {
            console.log(err);
        });
    };
    ChatPage.prototype.imageTap = function (src) {
        var modal = this.modalCtrl.create("ImagePopupPage", { imageSrc: src });
        modal.present();
    };
    __decorate([
        HostListener("input", ["$event.target"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [HTMLTextAreaElement]),
        __metadata("design:returntype", void 0)
    ], ChatPage.prototype, "onInput", null);
    __decorate([
        ViewChild(Content),
        __metadata("design:type", Content)
    ], ChatPage.prototype, "content", void 0);
    ChatPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-chat',
            template: "\n<ion-header scroll='false'>\n\t<ion-navbar>\n\t\t<button ion-button menuToggle icon-only>\n                <ion-icon name='menu'></ion-icon>\n            </button>\n\n\t\t<ion-title>\n\t\t\t<ion-item class=\"title-item\" no-lines>\n\t\t\t\t\n\t\t\t\t<ion-avatar item-start (click)=\"showProfile(senderUser)\" tappable>\n\t\t\t\t\t<img  [src]=\"_DomSanitizer.bypassSecurityTrustUrl(senderUser.profilePic)\"/>\n\t\t\t\t</ion-avatar>\n\n        \t<!--<ion-img  item-start  [src]=\"senderUser.profilePic\" (click)=\"showProfile(senderUser)\" tappable></ion-img>-->\n\n\t\t\t\t<h2 *ngIf=\"senderUser.name\" (click)=\"showProfile(senderUser)\" tappable>{{ senderUser.name }}</h2>\n\t\t\t\t<h2 *ngIf=\"!senderUser.name\" (click)=\"showProfile(senderUser)\" tappable>{{ senderUser.email }}</h2>\n\t\t\t\t<button ion-button color=\"light\" clear icon-only item-end (click)=\"showFriendOptions(senderUser)\" tappable>\n                        <ion-icon name=\"options\"></ion-icon>\n                    </button>\n\t\t\t</ion-item>\n\t\t</ion-title>\n\n\t</ion-navbar>\n</ion-header>\n\n<ion-content>\n\n\t<div *ngIf=\"isBusy\" class=\"container\" [ngClass]=\"{'busy': isBusy}\">\n\t\t<div class=\"backdrop\"></div>\n\t\t<ion-spinner></ion-spinner>\n\t</div>\n\t<div>\n\n  <ion-list>\n     <ion-item-group *ngFor=\"let message of messagesList; let i = index;\">\n\n     <ion-item-divider  style=\"text-align: center;\" *ngIf=\"showHeader(message,i)\" >{{message.DateCreated}}</ion-item-divider>\n    <ion-item  class=\"chat-page-ion-item\">\n     <div  *ngIf=\"message.type == 'text'\" >\n\t\t\t<ion-row *ngIf=\"message.sender_id == myuserid\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myright\"><span  [innerHTML]=\"message.message\" ></span><br><span class=\"mtime\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n\t\t\t<ion-row *ngIf=\"message.sender_id == senderUser.senderId\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myleft\"><span    [innerHTML]=\"message.message\"></span><br><span class=\"mtime\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n      </div>\n        <div  *ngIf=\"message.type == 'image'\" >\n\t\t\t<ion-row *ngIf=\"message.sender_id == myuserid\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myright-image\"><span > <img (click)=\"imageTap(message.message)\" style=\"opacity: 0.5;\" [src]=\"_DomSanitizer.bypassSecurityTrustUrl(message.message)\"/> </span><br><span class=\"mtime-image\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n\t\t\t<ion-row *ngIf=\"message.sender_id == senderUser.senderId\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myleft-image\"><span>  <img style=\"opacity: 0.5;\"  (click)=\"imageTap(message.message)\" [src]=\"_DomSanitizer.bypassSecurityTrustUrl(message.message)\"/></span><br><span class=\"mtime-image\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n      </div>\n    </ion-item>\n    </ion-item-group>\n  </ion-list>\n\n\t<!--<ion-list [virtualScroll]=\"messagesList\" [headerFn]=\"myHeaderFn\" [approxItemHeight]=\"'110px'\" bufferRatio=\"10\" no-lines>\n\t\t<ion-item-divider *virtualHeader=\"let header\" text-center>\n\t\t\t{{ header}}\n\t\t</ion-item-divider>\n\n\t\t<ion-item *virtualItem=\"let message\"  class=\"chat-page-ion-item\">\n      <div  *ngIf=\"message.type == 'text'\" >\n\t\t\t<ion-row *ngIf=\"message.sender_id == myuserid\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myright\"><span  [innerHTML]=\"message.message\" ></span><br><span class=\"mtime\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n\t\t\t<ion-row *ngIf=\"message.sender_id == senderUser.senderId\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myleft\"><span    [innerHTML]=\"message.message\"></span><br><span class=\"mtime\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n      </div>\n        <div  *ngIf=\"message.type == 'image'\" >\n\t\t\t<ion-row *ngIf=\"message.sender_id == myuserid\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myright-image\"><span > <img (click)=\"imageTap(message.message)\" style=\"opacity: 0.5;\" src=\"{{ message.message }}\"/> </span><br><span class=\"mtime-image\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n\t\t\t<ion-row *ngIf=\"message.sender_id == senderUser.senderId\" id=\"quote-{{message.mkey}}\">\n\t\t\t\t<p class=\"the-message\" style=\"width:100%;\"><span class=\"myleft-image\"><span>  <img style=\"opacity: 0.5;\"  (click)=\"imageTap(message.message)\" src=\"{{ message.message }}\"/></span><br><span class=\"mtime-image\">{{ message.time}}</span></span>\n\t\t\t\t</p>\n\t\t\t</ion-row>\n      </div>\n\t\t</ion-item>\n\t</ion-list> -->\n\t</div>\n</ion-content>\n<ion-footer>\n\t<ion-toolbar *ngIf=\"blockUser\" class=\"blocked-message\">\n\t\t<p text-center>{{ blockMsg }}</p>\n\t</ion-toolbar>\n\t<ion-toolbar *ngIf=\"!blockUser\">\n\t\t<textarea contenteditable=\"true\" placeholder='Type your message here' [(ngModel)]=\"message\" (click)='inputClick()' class=\"editableContent\"\n\t\t\tplaceholder='Type your message here' id=\"contentMessage\"></textarea>\n\n\t\t<ion-buttons end>\n     <button ion-button style=\"color:white;\" icon-right (click)='presentActionSheet()' tappable>\n                    <ion-icon name='attach'></ion-icon>\n                </button>\n\t\t\t<button ion-button icon-right color='primary' tappable (click)='sendMessage(\"text\")' tappable>\n                    Send\n                    <ion-icon name='send'></ion-icon>\n                </button>\n\t\t</ion-buttons>\n\t</ion-toolbar>\n</ion-footer>\n    ",
        }),
        __metadata("design:paramtypes", [ModalController, Camera, LoadingProvider, Platform, CommonProvider, DomSanitizer, ToastController, SQLite, Network, PushProvider, ElementRef, ActionSheetController, NavController, NgZone, NavParams, AlertController])
    ], ChatPage);
    return ChatPage;
}());
export { ChatPage };
//# sourceMappingURL=chat.js.map