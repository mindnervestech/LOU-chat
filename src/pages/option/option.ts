import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
declare var firebase;
import * as Message from '../../providers/message/message';

@IonicPage()
@Component({
  selector: 'page-option',
  templateUrl: 'option.html',
})
export class OptionPage {
   option: any = new Array();
   trepOption: any = new Array();
   TrainOrFliteNumber : string = "";
   optionValue : string = "";
   public selectedOption1:boolean = false;
   public selectedOption2:boolean = false;
   public selectedOption3:boolean = false;
   public selectedOption4:boolean = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    var me = this;
    var language = localStorage.getItem("language");
    firebase.database().ref().child('option/').orderByChild("language").equalTo(language).on('value',function(optionData){
      var value = optionData.val();
      me.option = [];
      for(var data in value){
        me.option.push(value[data]);
      }
    });

    firebase.database().ref().child('treapOtion/').orderByChild("language").equalTo(language).on('value',function(optionData){
      var value = optionData.val();
      me.trepOption = [];
      for(var data in value){
        me.trepOption.push(value[data]);
      }
    });

  }

  nextPage(){
    var data = {
      option : this.optionValue,
      optionValue : this.TrainOrFliteNumber,
      selectedOption1 : this.selectedOption1,
      selectedOption2 : this.selectedOption2,
      selectedOption3 : this.selectedOption3,
      selectedOption4 : this.selectedOption4
    };
    var me = this;
    if(this.selectedOption1 == false && this.selectedOption2 == false && this.selectedOption3 == false && this.selectedOption4 == false){
      let alert = me.alertCtrl.create({ subTitle: "Please select at list one option", buttons: ['OK'] });
        alert.present();
    }else{
      if(me.TrainOrFliteNumber != "" && me.optionValue != ""){
       firebase.database().ref('Group').orderByChild("trainNumber").equalTo(me.TrainOrFliteNumber).on('value', function (group) {
          if(group.val() == null){
             let alert = me.alertCtrl.create({ subTitle: "Please enter valid number", buttons: ['OK'] });
             alert.present();
          }else{
            firebase.database().ref('Group').orderByChild("trainNumber").equalTo(me.TrainOrFliteNumber).on('value', function (group) {
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
                }
                  var msg = me.tripeDateValidation(groupData.tripeDate,groupData.startTime,groupData.endTime);
                  if(msg == ""){
                    localStorage.setItem("option", JSON.stringify(data));  
                    me.navCtrl.setRoot("loginAndTopicInfo",data);
                  }else{
                    let alert = me.alertCtrl.create({ subTitle: msg, buttons: ['OK'] }); 
                    alert.present();
                  }

              });
            });
       
          }
       });       
      }else{
        let alert = me.alertCtrl.create({ subTitle: Message.FIELD_REQUIRED, buttons: ['OK'] });
        alert.present();
      }
    }
  }
   btnActivate(ionicButton,text) {
    if(ionicButton._color === 'dark'){
      ionicButton.color =  'primary';
        if(text == 1){
          this.selectedOption1 = true;
        }
        if(text == 2){
          this.selectedOption2 = true;
        }
        if(text == 3){
          this.selectedOption3 = true;
        }
        if(text == 4){
          this.selectedOption4 = true;
        }
    }
    else{
      ionicButton.color = 'dark';
      if(text == 1){
          this.selectedOption1 = false;
        }
        if(text == 2){
          this.selectedOption2 = false;
        }
        if(text == 3){
          this.selectedOption3 = false;
        }
        if(text == 4){
          this.selectedOption4 = false;
        }
    }
  }

  isSelected(event) {
    return 'primary';
    // event.target.getAttribute('selected') ? 'primary' : '';
  }

  tripeDateValidation(ripeDate,startDate,endDate){
        var msg = "";
        var convertDate = ripeDate.split("-");
        //var start = startDate.split(":");
        var end = endDate.split(":");
        var date = new Date();
        var dateCreated = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var todayDate = dateCreated.split(" ");
        var todayConvertDate = todayDate[0].split("-");
        var todayConvertTime = todayDate[1].split(":");
        if(parseInt(convertDate[0]) >= parseInt(todayConvertDate[0])){
          if(parseInt(convertDate[0]) == parseInt(todayConvertDate[0])){
            if(parseInt(convertDate[1]) >= parseInt(todayConvertDate[1])){
              if(parseInt(convertDate[1]) == parseInt(todayConvertDate[1])){
                if(parseInt(convertDate[2]) >= parseInt(todayConvertDate[2])){
                  if(parseInt(convertDate[2]) == parseInt(todayConvertDate[2])){
                    if(parseInt(end[0]) >= parseInt(todayConvertTime[0])){
                      if(parseInt(end[0]) == parseInt(todayConvertTime[0])){
                        if(parseInt(end[1]) > parseInt(todayConvertTime[1])){
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
                    msg = "";
                    return msg;
                  }
                }else{
                  msg = "This group chat is end at " + ripeDate;
                  return msg;
                }
              }else{
                msg = "";
                return msg;
              }
            }else{
              msg = "This group chat is end at " + ripeDate;
              return msg;
            }
          }else{
            msg = "";
            return msg;
          }
        }else{
          msg = "This group chat is end at " + ripeDate;
          return msg;
        }   
    }
}
