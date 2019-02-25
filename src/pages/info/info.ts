import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
declare var firebase;
/**
 * Generated class for the InfoPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-info',
  templateUrl: 'info.html',
})
export class InfoPage {
 
  adPage: boolean = false;
  titleName: string = '';
  business: any = [];
  home: any = [];
  people: any = [];
  tour: any = []; 
  active: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    var title = JSON.parse(localStorage.getItem("Group"));
    this.titleName = title.groupName;
    console.log('this.titleName',this.titleName); 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoPage');
    this.adPage = true;
    this.busssiness('business');
  }
  goTo(){
    this.navCtrl.setRoot("FriendlistPage");
  }

  chatPage(){
    this.navCtrl.push("FriendlistPage");   
  }

  infoPage(){
      this.navCtrl.push("InfoPage");   
  }

  mePage(){
      this.navCtrl.push("ProfilePage");   
  }

  busssiness(name){
    let self =this;
    self.business=[];
    self.active = name;
    firebase.database().ref('Ads/'+ name).on('value', function (snapshot) {
      for(var i = 1;i < snapshot.val().length;i++){
        firebase.database().ref('Ads/'+name+'/'+ i).on('value', function (snapshot) {
          if(snapshot.val() != null && snapshot.val() != ''){
            var date = new Date(snapshot.val().date);
            var data = {
              title: snapshot.val().title,
              description: snapshot.val().description,
              date: date,
              image: snapshot.val().image,
            }
            self.business.push(data);
          }    
        });
      }
    });
  }

  // homework(){
  //  let self = this;
  //  self.to = false;
  //  self.bu = false;
  //  self.vi = false;
  //  self.home = [];
  //  firebase.database().ref('Ads/homework').on('value', function (snapshot) {
  //    for(var i = 1;i < snapshot.val().length;i++){
  //      firebase.database().ref('Ads/homework/'+ i).on('value', function (snapshot) {
  //        if(snapshot.val() != null && snapshot.val() != ''){
  //          //console.log("home",snapshot.val());
  //          self.home.push(snapshot.val());
  //          console.log("home",self.home);
  //         }
  //       });
  //     }
  //     self.ho = true;
  //   });
  // }
  // tourism(self){
  //   this.to = true;
  //   this.ho = false;
  //   this.bu = false;
  //   this.vi = false;
  //   firebase.database().ref('Ads/tourism').on('value', function (snapshot) {
  //     for(var i = 1;i < snapshot.val().length;i++){
  //       firebase.database().ref('Ads/tourism/'+ i).on('value', function (snapshot) {
  //         if(snapshot.val() != null && snapshot.val() != ''){
  //           self.tour.push(snapshot.val());
  //         }    
  //       });
  //     }
  //   });
  // }
  // visit(self){
  //   this.vi = true;
  //   this.to = false;
  //   this.ho = false;
  //   this.bu = false;
  //   firebase.database().ref('Ads/visit').on('value', function (snapshot) {
  //     for(var i = 1;i < snapshot.val().length;i++){
  //       firebase.database().ref('Ads/visit/'+ i).on('value', function (snapshot) {
  //         if(snapshot.val() != null && snapshot.val() != ''){
  //           self.people.push(snapshot.val());
  //         }    
  //       });
  //     }
  //   });
  // }
}
