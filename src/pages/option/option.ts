import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
declare var firebase;
import * as Message from '../../providers/message/message';
/**
 * Generated class for the OptionPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-option',
  templateUrl: 'option.html',
})
export class OptionPage {
   option: any = new Array();
   TrainOrFliteNumber : string = "";
   optionValue : string = "";
   /*public selectedOption1:boolean = false;
   public selectedOption2:boolean = false;
   public selectedOption3:boolean = false;
   public selectedOption4:boolean = false;*/

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    var me = this;
    firebase.database().ref().child('option/').on('value',function(optionData){
      var value = optionData.val();
      for(var data in value){
        me.option.push(value[data]);
      }
    });
  }

  /*selectedValue(event : any,text){
    if(text == "option1"){
      this.selectedOption1 = event.checked;
    }
    if(text == "option2"){
      this.selectedOption2 = event.checked;
    }
    if(text == "option3"){
      this.selectedOption3 = event.checked;
    }
    if(text == "option4"){
      this.selectedOption4 = event.checked;
    }
  }*/

  nextPage(){
    var data = {
      option : this.optionValue,
      optionValue : this.TrainOrFliteNumber,
      /*selectedOption1 : this.selectedOption1,
      selectedOption2 : this.selectedOption2,
      selectedOption3 : this.selectedOption3,
      selectedOption4 : this.selectedOption4,*/
    };
    var me = this;
    if(me.TrainOrFliteNumber != "" && me.optionValue != ""){
       firebase.database().ref('Group').orderByChild("trainNumber").equalTo(me.TrainOrFliteNumber).on('value', function (group) {
          console.log(group.val());
          if(group.val() == null){
             let alert = me.alertCtrl.create({ subTitle: "Please enter valid number", buttons: ['OK'] });
             alert.present();
          }else{
            localStorage.setItem("option", JSON.stringify(data));  
            me.navCtrl.setRoot("loginAndTopicInfo",data);
          }
       });       
    }else{
      let alert = me.alertCtrl.create({ subTitle: Message.FIELD_REQUIRED, buttons: ['OK'] });
      alert.present();
    }
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
}
