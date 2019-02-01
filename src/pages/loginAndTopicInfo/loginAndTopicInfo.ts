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
	nickName: string = "";
  groupInfo: any;
  userProfilePic : string = ""; 
  user_profilePic: string = "";

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
     var user = JSON.parse(localStorage.getItem("loginUser"));
      if (!user) {
            this.userProfilePic = "assets/image/profile.png";
        }else{
          console.log("user",user);
          this.nickName = user.name;
          this.user_profilePic = user.profilePic;
          this.userProfilePic = (user.profilePic != '') ? user.profilePic : "assets/image/profile.png";
          console.log(this.userProfilePic);
        }
    	this.navParams.data
      console.log(this.navParams.data);
      var me = this;
      var trainData = this.navParams.data;
      console.log(trainData.optionValue);
      firebase.database().ref('Group').orderByChild("trainNumber").equalTo(trainData.optionValue).on('value', function (group) {
              console.log(group.val());
              var groupKey = Object.keys(group.val())[0];
              firebase.database().ref('Group/'+ groupKey).on("value", function(GroupInformation){
                console.log(GroupInformation.val());
                var groupData = {
                  key : groupKey,
                  unreadCount : GroupInformation.val().unreadCount,
                  lastMessage : GroupInformation.val().lastMessage,
                  groupId : GroupInformation.val().groupId,
                  groupName : GroupInformation.val().groupName,
                  tripeDate : GroupInformation.val().tripeDate,
                  startTime:  GroupInformation.val().startTime,
                  endTime:  GroupInformation.val().endTime,
                }
                me.groupInfo = groupData;
                localStorage.setItem("Group", JSON.stringify(groupData));
              });
            });
  }
  	GoToFriendListPage() {
    	this.navCtrl.push("FriendlistPage");
      }
      
    
   btnActivate(ionicButton) {
    if(ionicButton._color === 'dark')
      ionicButton.color =  'primary';
    else
      ionicButton.color = 'dark';
  }

  isSelected(event) {
    console.log(event);
    return 'primary';
    // event.target.getAttribute('selected') ? 'primary' : '';
  }

    tripeDateValidation(ripeDate,startDate,endDate){
        var msg = "";
        var convertDate = ripeDate.split("-");
        console.log("convertDate",convertDate);
        var start = startDate.split(":");
        var end = endDate.split(":");
        console.log("endDate",endDate);
        console.log(convertDate);
        var date = new Date();
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log("dateCreated",dateCreated);
        var todayDate = dateCreated.split(" ");
        var todayConvertDate = todayDate[0].split("-");
        var todayConvertTime = todayDate[1].split(":");
        if(convertDate[0] != todayConvertDate[0] || convertDate[1] != todayConvertDate[1] || convertDate[2] != todayConvertDate[2]){
            console.log("data Invalid");
             var st1 = parseInt(start[0]) - 2
            msg = "This group chat not start yet. It's start at " + ripeDate + " " + st1 + ":" + start[1];
            return msg;
        }else{
            console.log("data valid");
            if(parseInt(start[0]) - 2 <= parseInt(todayConvertTime[0]) && parseInt(start[1]) <= parseInt(todayConvertTime[1]) ){
                if(parseInt(end[0]) >= parseInt(todayConvertTime[0])){
                    msg = "";
                    return msg;
                }else{
                    msg = "This group chat is end at " + ripeDate + " " + endDate;
                    return msg;
                }
            }else{
                var st = parseInt(start[0]) - 2
                    msg = "This group chat not start yet. It's start at " + ripeDate + " " + st + ":" + start[1];
                    return msg;
            }
        }
    }

    LoginUser(){
      var user = JSON.parse(localStorage.getItem("loginUser"));
      if (!user) {
            this.newLoginUser();
        }else{
          //user data update and add member to group
          console.log("user",user);
          this.LoadingProvider.startLoading();
          var group_id = this.groupInfo.groupId;
          var date = new Date();
          var key = localStorage.getItem("userId");
          var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
          firebase.database().ref().child('GroupMember/'+ group_id + '/' + key).set({
            groupId : group_id,
            DateCreated: dateCreated,
            userId : user.access_code,
            lastDate : dateCreated,
            unreadCount : this.groupInfo.unreadCount,
            lastMessage: this.groupInfo.lastMessage
          });

          var phofilePic = "";
            if(this.base64Image != undefined){
              phofilePic = this.base64Image;
            }
          firebase.database().ref().child('users/'+ key).update({
            "profilePic" : phofilePic,
            "tripe" : {
              "Business" : this.navParams.data.selectedOption1,
              "Tourism" : this.navParams.data.selectedOption2,
              "VisitPeople" : this.navParams.data.selectedOption3,
              "HomeWork" :this.navParams.data.selectedOption4,
            }
          }).then(()=>{
            var groupData = JSON.parse(localStorage.getItem("Group"));
            console.log(groupData);
            var msg = this.tripeDateValidation(groupData.tripeDate,groupData.startTime,groupData.endTime);
            if(msg == ""){
              this.LoadingProvider.closeLoading();
              this.navCtrl.setRoot("FriendlistPage");
            }else{
              this.LoadingProvider.closeLoading();
                let actionSheet = this.alertCtrl.create({
                title: 'The chat room is not yet opened, but you can already see some tips for your topics',
                buttons: [
                    {
                        text: 'Go',
                        handler: () => {
                            this.GoToFriendListPage();
                        }
                    }
                ]
            });
            actionSheet.present();
           }
       
          });
        }
    }
  	newLoginUser(){
  		var me = this;
  		localStorage.setItem("value", "true");

  		if(me.nickName != ""){
  			me.LoadingProvider.startLoading();
  			console.log("nickName",me.nickName);

  			firebase.database().ref('users').orderByChild("name").equalTo(me.nickName).on('value', function (user) {
  				console.log("user",user.val());
  				if(user.val() == null){
  					localStorage.setItem("value", "false");
  					console.log(me.base64Image);
  					var phofilePic = "";
  					if(me.base64Image != undefined){
  						phofilePic = me.base64Image;
  					}
  					var profilePhoto = (me.base64Image == undefined) ? 'assets/image/profile.png' : me.base64Image;
  					var access_code = me.CommonProvider.randomString();
  					firebase.database().ref().child('users').push({
            			created : new Date().getTime(),
  					 	name : me.nickName,
  					 	access_code: access_code,
  					 	profilePic : phofilePic,
  					 	status: "",
  					 	gender:"",
  					 	email: "",
  					 	pushToken: "123456",
              tripe : {
                Business : false,//me.navParams.data.selectedOption1,
                Tourism : false,//me.navParams.data.selectedOption2,
                VisitPeople : false,//me.navParams.data.selectedOption3,
                HomeWork : false//me.navParams.data.selectedOption4,
              }
          			}).then(()=>{
          				console.log("in");
		            	setTimeout(() => {
		            	firebase.database().ref('users').orderByChild("name").equalTo(me.nickName).on('value', function (userInfo) {
							      var key = Object.keys(userInfo.val())[0];
							      console.log(userInfo.val());
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
                    var groupData = JSON.parse(localStorage.getItem("Group"));
                        console.log(groupData);
                        var msg = this.tripeDateValidation(groupData.tripeDate,groupData.startTime,groupData.endTime);
                        if(msg == ""){
                          this.LoadingProvider.closeLoading();
                          this.navCtrl.setRoot("FriendlistPage");
                        }else{
                          this.LoadingProvider.closeLoading();
                            let actionSheet = this.alertCtrl.create({
                            title: 'The chat room is not yet opened, but you can already see some tips for your topics',
                            buttons: [
                                {
                                    text: 'Go',
                                    handler: () => {
                                        this.GoToFriendListPage();
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