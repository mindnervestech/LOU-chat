import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, MenuController, ActionSheetController } from 'ionic-angular';
import { global } from '../global/global';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
//import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { CommonProvider } from '../../providers/common/common';
import { LoadingProvider } from '../../providers/loading/loading';
import { Camera } from '@ionic-native/camera';
//import { GooglePlus } from '@ionic-native/google-plus';
//import * as Message from '../../providers/message/message';
//import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
declare var firebase;

@IonicPage()

@Component({
  selector: 'loginAndTopicInfo',
  templateUrl: 'loginAndTopicInfo.html',
})

export class loginAndTopicInfo {

	usernameInfo : any;
	base64Image: any;
  counter = 0;
  trepOption: any = new Array();
  servesOption: any = new Array();
	nickName: string = "";
    groupInfo: any;
    userProfilePic : string = ""; 
    user_profilePic: string = "assets/image/profile.png";

	constructor(public LoadingProvider: LoadingProvider,
	public CommonProvider: CommonProvider,
	private network: Network,
	public toastCtrl: ToastController,
	public menu: MenuController,
	private _zone: NgZone,
	public events: Events,
	public alertCtrl: AlertController,
	public navCtrl: NavController,
	public navParams: NavParams,
	public actionSheetCtrl: ActionSheetController,
	private camera: Camera) {
	    localStorage.setItem("isFirstTimeLoginTrue", "true");
	    this.menu.swipeEnable(false);
	}

	ionViewDidEnter() {
    var language = localStorage.getItem("language");
    var me = this;
    me.LoadingProvider.startLoading();
    firebase.database().ref().child('information/').orderByChild("language").equalTo(language).on('value',function(optionData){
      var value = optionData.val();
      me.trepOption = [];
      for(var data in value){
        var info = {
          option : value[data].option,
          optionNumber : value[data].optionNumber,
          value : false
        }
        me.trepOption.push(info);
      }
      me.LoadingProvider.closeLoading();
    });
    firebase.database().ref().child('services/').orderByChild("language").equalTo(language).on('value',function(optionData){
      var value = optionData.val();
      me.servesOption = [];
      for(var data in value){
        var info = {
          option : value[data].option,
          optionNumber : value[data].optionNumber,
          value : false
        }
        me.servesOption.push(info);
      }
      me.LoadingProvider.closeLoading();
    });

     var user = JSON.parse(localStorage.getItem("loginUser"));
      if (!user) {
            me.user_profilePic = "assets/image/profile.png";
        }else{
          me.nickName = user.name;
          me.user_profilePic = (user.profilePic != '') ? user.profilePic : "assets/image/profile.png";
        }
      var trainData = me.navParams.data;
      firebase.database().ref('Group').orderByChild("trainNumber").equalTo(trainData.optionValue).on('value', function (group) {
              var groupKey = Object.keys(group.val())[0];
              firebase.database().ref('Group/'+ groupKey).on("value", function(GroupInformation){
                var groupData = {
                  key : groupKey,
                  unreadCount : GroupInformation.val().unreadCount,
                  lastMessage : GroupInformation.val().lastMessage,
                  groupId : GroupInformation.val().groupId,
                  groupName : GroupInformation.val().groupName,
                  tripeDate : GroupInformation.val().tripeDate,
                  startTime:  GroupInformation.val().startTime,
                  endTime:  GroupInformation.val().endTime,
                  type :  GroupInformation.val().type,
                }
                me.groupInfo = groupData;
                localStorage.setItem("Group", JSON.stringify(groupData));
              });
            });
    }

  	GoToFriendListPage() {
    	this.navCtrl.push("FriendlistPage");
    }
      
    
   btnActivate(ionicButton,text) {
    if(ionicButton._color === 'dark'){
      ionicButton.color =  'primary';
      this.trepOption[text - 1].value = true;
      this.counter++;
    }
    else{
      ionicButton.color = 'dark';
      this.trepOption[text - 1].value = false;
      this.counter--;
    }
  }

  isSelected(event) {
    return 'primary';
    // event.target.getAttribute('selected') ? 'primary' : '';
  }

    tripeDateValidation(ripeDate,startDate,endDate){
        var msg = "";
        var convertDate = ripeDate.split("-");
        var start = startDate.split(":");
        //var end = endDate.split(":");
        var date = new Date();
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var todayDate = dateCreated.split(" ");
        var todayConvertDate = todayDate[0].split("-");
        var todayConvertTime = todayDate[1].split(":");
        var groupInfo = JSON.parse(localStorage.getItem("Group"));
        if(groupInfo.type == "Train"){
          var st1 = parseInt(start[0]) - 2
          if(convertDate[0] == todayConvertDate[0] && convertDate[1] == todayConvertDate[1] && convertDate[2] == todayConvertDate[2]){
              if(parseInt(start[0]) - 2 <= parseInt(todayConvertTime[0])){
                if(parseInt(start[0]) - 2 == parseInt(todayConvertTime[0])){
                  if(parseInt(start[1]) >= parseInt(todayConvertTime[1])){
                    msg = "";
                    return msg;
                  }else{
                    msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
                    return msg;
                  }
                }else{
                  msg = "";
                  return msg;
                }
              }else{
                msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
                return msg;
              }
          }else{
            msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
            return msg;
          }
        }else{
          var st1 = parseInt(start[0]) - 4
          if(convertDate[0] == todayConvertDate[0] && convertDate[1] == todayConvertDate[1] && convertDate[2] == todayConvertDate[2]){
              if(parseInt(start[0]) - 4 <= parseInt(todayConvertTime[0])){
                if(parseInt(start[0]) - 4 == parseInt(todayConvertTime[0])){
                  if(parseInt(start[1]) >= parseInt(todayConvertTime[1])){
                    msg = "";
                    return msg;
                  }else{
                    msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
                    return msg;
                  }
                }else{
                  msg = "";
                  return msg;
                }
              }else{
                msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
                return msg;
              }
          }else{
            msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
            return msg;
          }
        }
    }

    LoginUser(){
      var user = JSON.parse(localStorage.getItem("loginUser"));
      var me = this;
      if (!user) {
            me.newLoginUser();
        }else{
          //user data update and add member to group
          var _user = JSON.parse(localStorage.getItem("loginUser"));
          if(_user.name == me.nickName){
            me.LoadingProvider.startLoading();
            var group_id = me.groupInfo.groupId;
            var date = new Date();
            var key = user.uid;
            localStorage.setItem("IsLogin", 'true');
            var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            firebase.database().ref().child('GroupMember/'+ group_id + '/' + key).set({
              groupId : group_id,
              DateCreated: dateCreated,
              userId : user.access_code,
              lastDate : dateCreated,
              unreadCount : me.groupInfo.unreadCount,
              lastMessage: me.groupInfo.lastMessage
            });

            var phofilePic = user.profilePic;
            console.log(me.servesOption);
            me.servesOption[0].value = me.navParams.data.servesOption1;
            me.servesOption[1].value = me.navParams.data.servesOption2,
            me.servesOption[2].value = me.navParams.data.servesOption3,
            firebase.database().ref().child('users/'+ key).update({
              "profilePic" : phofilePic,
              "groupName" : me.groupInfo.groupName,
              "tripe" : {
                "Home work trip" : me.navParams.data.selectedOption1,
                "Tourism" : me.navParams.data.selectedOption2,
                "Business tripe" : me.navParams.data.selectedOption3,
                "To visit people" :me.navParams.data.selectedOption4,
                "Participate to an event" : me.navParams.data.selectedOption5,
              },
              "information" : me.trepOption,
              "services" : me.servesOption,
            }).then(()=>{
              var groupData = JSON.parse(localStorage.getItem("Group"));
              var msg = me.tripeDateValidation(groupData.tripeDate,groupData.startTime,groupData.endTime);
              if(msg == ""){
                if(me.counter == 0){
                  me.LoadingProvider.closeLoading();
                  let alert = me.alertCtrl.create({ subTitle: "Please select at list one trip purpose", buttons: ['OK'] });
                  alert.present();
                }else{
                  me.LoadingProvider.closeLoading();
                  me.navCtrl.setRoot("FriendlistPage");
                }
              }else{
                me.LoadingProvider.closeLoading();
                  let actionSheet = me.alertCtrl.create({
                  title: 'The chat room is not yet opened, but you can already see some tips for your trip',
                  buttons: [
                      {
                          text: 'Go',
                          handler: () => {
                              me.GoToFriendListPage();
                          }
                      }
                  ]
              });
              actionSheet.present();
             }
         
            });
          }else{
            //if user login as a new user
            localStorage.removeItem("loginUser");
            me.newLoginUser();
          }
          
        }
    }
  	newLoginUser(){
  		var me = this;
  		localStorage.setItem("value", "true");
  		if(me.nickName != ""){
  			me.LoadingProvider.startLoading();

  			firebase.database().ref('users').orderByChild("name").equalTo(me.nickName).on('value', function (user) {
  				if(user.val() == null){
            var groupData = JSON.parse(localStorage.getItem("Group"));
            localStorage.setItem("value", "false");
            var phofilePic = "";
            if(me.base64Image != undefined){
              phofilePic = me.base64Image;
            }
            var app = localStorage.getItem("AppId");
            var profilePhoto = (me.base64Image == undefined) ? 'assets/image/profile.png' : me.base64Image;
            var access_code = me.CommonProvider.randomString();
            me.servesOption[0].value = me.navParams.data.servesOption1;
            me.servesOption[1].value = me.navParams.data.servesOption2,
            me.servesOption[2].value = me.navParams.data.servesOption3,
            firebase.database().ref().child('users').push({
                  created : new Date().getTime(),
               name : me.nickName,
               access_code: access_code,
               profilePic : phofilePic,
               status: "",
               gender:"",
               age: "",
               groupName : me.groupInfo.groupName,
               pushToken: app,
              tripe : {
                "Home work trip" : me.navParams.data.selectedOption1,
                "Tourism" : me.navParams.data.selectedOption2,
                "Business tripe" : me.navParams.data.selectedOption3,
                "To visit people" : me.navParams.data.selectedOption4,
                "Participate to an event" : me.navParams.data.selectedOption5,
              },
              information : me.trepOption,
              services : me.servesOption,
                }).then(()=>{
                  setTimeout(() => {
                  firebase.database().ref('users').orderByChild("name").equalTo(me.nickName).on('value', function (userInfo) {
                    var key = Object.keys(userInfo.val())[0];
                    global.USER_IMAGE = profilePhoto;
                    global.USER_NAME = me.nickName;
                    global.USER_ACCESS_CODE = access_code;
                    me.events.publish("LOAD_USER_UPDATE", "");
                    localStorage.setItem("IsLogin", 'true');
                    localStorage.setItem("userId", key);
                    var logInUser = {
                        name :  me.nickName,
                        access_code : access_code,
                        profilePic : phofilePic,
                        uid : key
                    };
                    localStorage.setItem("loginUser", JSON.stringify(logInUser));
                    var group_id = me.groupInfo.groupId;
                    var date = new Date();
                    var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                    firebase.database().ref().child('GroupMember/'+ group_id + '/' + key).set({
                        groupId : group_id,
                        DateCreated: dateCreated,
                        userId : access_code,
                        lastDate : dateCreated,
                        unreadCount : me.groupInfo.unreadCount,
                        lastMessage: me.groupInfo.lastMessage
                    });
                        var msg = me.tripeDateValidation(groupData.tripeDate,groupData.startTime,groupData.endTime);
                        if(msg == ""){
                          if(me.counter == 0){
                            me.LoadingProvider.closeLoading();
                            let alert = me.alertCtrl.create({ subTitle: "Please select at list one trip purpose", buttons: ['OK'] });
                            alert.present();
                          }else{
                            me.LoadingProvider.closeLoading();
                            me.navCtrl.setRoot("FriendlistPage");
                          }
                        }else{
                          me.LoadingProvider.closeLoading();
                            let actionSheet = me.alertCtrl.create({
                            title: 'The chat room is not yet opened, but you can already see some tips for your topics',
                            buttons: [
                                {
                                    text: 'Go',
                                    handler: () => {
                                        me.GoToFriendListPage();
                                    }
                                }
                            ]
                        });
                        actionSheet.present();
                       }
						    //me.LoadingProvider.closeLoading();
						    //me.navCtrl.setRoot("FriendlistPage");
		            	});
			            }, 1500);
		            });
		            
  				}else{
  					if(localStorage.getItem("value") == "true"){
	  					me.LoadingProvider.closeLoading();
	  					let alert = me.alertCtrl.create({ subTitle: "This name is all ready use please try another name", buttons: ['OK'] });
	      				alert.present();
	      				me.nickName = "";
  					}
  				}
  			});

  		}else{
  			let alert = me.alertCtrl.create({ subTitle: "Please enter nick name", buttons: ['OK'] });
      		alert.present();
  		}
  	}
  	presentActionSheet(){
  		let actionSheet = this.actionSheetCtrl.create({
	        title: 'Profile Photo',
	        buttons: [
	            {
	                text: 'Upload Photo',
	                handler: () => {
	                    this.gallaryUpload();
	                }
	            },
	            {
	                text: 'Take Photo',
	                handler: () => {
	                    this.cameraUpload();
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
  	gallaryUpload() {
    const filename = Math.floor(Date.now() / 1000);
    var me = this;
    me.camera.getPicture({
        sourceType: me.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: me.camera.DestinationType.DATA_URL,
        quality: 50,
        encodingType: me.camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        allowEdit: true,
        correctOrientation: true
    }).then((imageData) => {
        // imageData is a base64 encoded string
        me.base64Image = "data:image/jpeg;base64," + imageData;
        me.user_profilePic = me.base64Image;
        var user = JSON.parse(localStorage.getItem("loginUser"));    
        var logInUser = {
            name :  user.name,
            access_code : user.access_code,
            profilePic : me.user_profilePic,
            uid : user.uid
        }
        localStorage.setItem("loginUser", JSON.stringify(logInUser));
        var uploadTask = firebase.storage().ref().child(`${filename}.jpg`).putString(imageData, "base64");
        uploadTask.on('state_changed', function (snapshot) {
        }, function (error) {
            alert(error);
        }, function () {
            var downloadFlyerURL = uploadTask.snapshot.downloadURL;
            me.usernameInfo.profilePic = downloadFlyerURL;
            var userId = firebase.auth().currentUser.uid;
            var usersRef = firebase.database().ref('users');
            var hopperRef = usersRef.child(userId);
            hopperRef.update({
                "profilePic": downloadFlyerURL
            });
            global.USER_IMAGE = downloadFlyerURL;
           /* me.events.publish("LOAD_USER_UPDATE", "");
            me._zone.run(() => {
                me.sqlite.create({
                    name: 'data.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        me.sqlDb = db;
                        me.toDataUrl(downloadFlyerURL, function (myBase64) {
                            me.sqlDb.executeSql("UPDATE userProfile SET user_profilePic='" + myBase64 + "' where user_id = '" + userId + "'", [])
                                .then(() => {

                                })
                                .catch(e => alert('Unable to update sql: ' + JSON.stringify(e)));
                        });
                    });
            });*/

        });
    }, (err) => {
        console.log(err);
    });
  }

  cameraUpload() {
    const filename = Math.floor(Date.now() / 1000);
    var me = this;
    me.camera.getPicture({
        quality: 50,
        destinationType: me.camera.DestinationType.DATA_URL,
        encodingType: me.camera.EncodingType.JPEG,
        mediaType: me.camera.MediaType.PICTURE,
        targetWidth: 500,
        targetHeight: 500,
        allowEdit: true,
        correctOrientation: true
    }).then((imageData) => {
        // imageData is a base64 encoded string
            me.base64Image = "data:image/jpeg;base64," + imageData;
            me.user_profilePic = me.base64Image;
            var user = JSON.parse(localStorage.getItem("loginUser"));    
            var logInUser = {
                name :  user.name,
                access_code : user.access_code,
                profilePic : me.user_profilePic,
                uid : user.uid
            }
            localStorage.setItem("loginUser", JSON.stringify(logInUser));
	        var uploadTask = firebase.storage().ref().child(`${filename}.jpg`).putString(imageData, "base64");
	        uploadTask.on('state_changed', function (snapshot) {
	        }, function (error) {
	            alert(error);
	        }, function () {
	            var downloadFlyerURL = uploadTask.snapshot.downloadURL;
	            me.usernameInfo.profilePic = downloadFlyerURL;
	            var userId = firebase.auth().currentUser.uid;
	            var usersRef = firebase.database().ref('users');
	            var hopperRef = usersRef.child(userId);
	            hopperRef.update({
	                "profilePic": downloadFlyerURL
	            });
	            global.USER_IMAGE = downloadFlyerURL;
	          /*  me.events.publish("LOAD_USER_UPDATE", "");
	            me._zone.run(() => {
	                me.sqlite.create({
	                    name: 'data.db',
	                    location: 'default'
	                })
	                    .then((db: SQLiteObject) => {
	                        me.sqlDb = db;
	                        me.toDataUrl(downloadFlyerURL, function (myBase64) {
	                            me.sqlDb.executeSql("UPDATE userProfile SET user_profilePic='" + myBase64 + "' where user_id = '" + userId + "'", [])
	                                .then(() => {

	                                })
	                                .catch(e => alert('Unable to update sql: ' + JSON.stringify(e)));
	                        });
	                    });
	            });
*/
	        });
    	}, (err) => {
        	console.log(err);
    	});
	}
}