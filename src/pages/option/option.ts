import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
declare var firebase;
import * as Message from '../../providers/message/message';
import { global } from '../global/global';

@IonicPage()
@Component({
  selector: 'page-option',
  templateUrl: 'option.html',
})
export class OptionPage {
   option: any = new Array();
   trepOption: any = new Array();
   servicesOption: any = new Array();
   TrainOrFliteNumber : string = "";
   optionValue : string = "";
   selected: any;
   tripeValue : any;
   public selectedOption1:boolean = false;
   public selectedOption2:boolean = false;
   public selectedOption3:boolean = false;
   public selectedOption4:boolean = false;
   public selectedOption5:boolean = false;
   public servesOption1:boolean = false;
   public servesOption2:boolean = false;
   public servesOption3:boolean = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController) {
    global.backPage = "EXIT";
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

    firebase.database().ref().child('services/').orderByChild("language").equalTo(language).on('value',function(optionData){
      var value = optionData.val();
      me.servicesOption = [];
      for(var data in value){
        me.servicesOption.push(value[data]);
      }
    });
  }
  optionClick(event,text){
    this.selected = text; 
    if(text == "Train"){
      this.optionValue = text;
      this.tripeValue = "Train"
    }else{
      this.optionValue = text;
      this.tripeValue = "Flight"
    }
  }
  isActive(text){
    return this.selected === text;
  }
  nextPage(){
    var data = {
      tripeValue : this.tripeValue,
      optionValue : this.TrainOrFliteNumber,
      selectedOption1 : this.selectedOption1,
      selectedOption2 : this.selectedOption2,
      selectedOption3 : this.selectedOption3,
      selectedOption4 : this.selectedOption4,
      selectedOption5 : this.selectedOption5,
      servesOption1 : this.servesOption1,
      servesOption2 : this.servesOption2,
      servesOption3 : this.servesOption3,
    };
    var me = this;
    if(this.servesOption1 == false && this.servesOption2 == false && this.servesOption3 == false && this.selectedOption4 == false){
      let alert = me.alertCtrl.create({ subTitle: "Please select at list one option", buttons: ['OK'] });
      alert.present();
    }else{
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
                    type :  GroupInformation.val().type,
                  }
                    var msg = me.tripeDateValidation(groupData.tripeDate,groupData.startTime,groupData.endTime);
                    if(msg == ""){
                      console.log(groupData.type,me.tripeValue);
                      if(groupData.type !=  me.tripeValue){
                        let alert = me.alertCtrl.create({ subTitle: "Please select valid tripe number", buttons: ['OK'] }); 
                        alert.present();
                      }else{
                        localStorage.setItem("option", JSON.stringify(data));  
                        me.navCtrl.setRoot("loginAndTopicInfo",data);
                      }
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
        if(text == 5){
          this.selectedOption5 = true;
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
        if(text == 5){
          this.selectedOption5 = false;
        }
    }
  }

  servesBtnActivate(ionicButton,text){
     if(ionicButton._color === 'dark'){
      ionicButton.color =  'primary';
        if(text == 1){
          this.servesOption1 = true;
        }
        if(text == 2){
          this.servesOption2 = true;
        }
        if(text == 3){
          this.servesOption3 = true;
        }
    }
    else{
      ionicButton.color = 'dark';
        if(text == 1){
          this.servesOption1 = false;
        }
        if(text == 2){
          this.servesOption2 = false;
        }
        if(text == 3){
          this.servesOption3 = false;
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
                          msg = "This caht room is not available";
                          return msg;
                        }
                      }else{
                        msg = "";
                        return msg;
                      }
                    }else{
                      msg = "This caht room is not available";
                      return msg;
                    }
                  }else{
                    msg = "";
                    return msg;
                  }
                }else{
                  msg = "This caht room is not available";
                  return msg;
                }
              }else{
                msg = "";
                return msg;
              }
            }else{
              msg = "This caht room is not available";
              return msg;
            }
          }else{
            msg = "";
            return msg;
          }
        }else{
          msg = "This caht room is not available";
          return msg;
        }   
    }
}
