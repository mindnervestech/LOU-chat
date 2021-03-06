import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, App  } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingProvider } from '../../providers/loading/loading';
import { TranslateService } from '@ngx-translate/core';
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
  showAdsText: boolean = false;
  trainN: string = '';
  arrival: string = '';
  constructor(public translate: TranslateService,public app: App,public LoadingProvider: LoadingProvider,public navCtrl: NavController, public navParams: NavParams,private iab: InAppBrowser,public _DomSanitizer: DomSanitizer) {
    var title = JSON.parse(localStorage.getItem("Group"));
    this.titleName = title.groupName;
    console.log('this.titleName',this.titleName); 
  }

  ionViewDidLoad() {
    this.LoadingProvider.startLoading();
    console.log('ionViewDidLoad InfoPage');
    this.adPage = true;
    this.busssiness('business');
    this.getLang();
    this.getGroup();
  }
  getGroup(){
    let me = this;
    var id = JSON.parse(localStorage.getItem("Group"));
    firebase.database().ref('Group').orderByChild("groupId").equalTo(id.groupId).on('value', function (group) {
      // console.log("---",group.val());
      // me.trainN = group.val().type + " " + group.val().trainNumber;
      // me.arrival = group.val().arrivalCity;
      var value = group.val();
      for(var data in value){
        me.trainN = value[data].type + " " + value[data].trainNumber;
        me.arrival = value[data].arrivalCity;
      }
    });
  }
  ionViewWillLeave(){
    this.LoadingProvider.closeLoading();
  }
  goTo(){
    this.navCtrl.setRoot("FriendlistPage");
  }
  getLang(){
    var lang = localStorage.getItem('lan');
    this.translate.use(lang);           
    console.log("lang",lang);
  }
  // openWebpage(data: string){
  //   console.log("link",data);
  //   const browser = this.iab.create(data);
  // }
  chatPage(){
    this.app.getRootNav().push("FriendlistPage");   
  }

  mePage(){
    this.app.getRootNav().push("ProfilePage");   
  }

  busssiness(name){
    let self =this;
    self.business=[];
    self.active = name;
    self.showAdsText = false;
    var id = JSON.parse(localStorage.getItem("Group"));
    //firebase.database().ref('Ads/'+ name + '/' + id.groupId).on('value', function (snapshot) {
      firebase.database().ref('Ads/'+ name + '/' + id.groupId).orderByChild("status").equalTo('Active').on('value', function (snapshot) {  
      var ads = snapshot.val();
      for(var data in ads){
        var snap = {
                   title: ads[data].title,
                   description: ads[data].description,
                   date:  ads[data].date,
                   image: self._DomSanitizer.bypassSecurityTrustStyle(`url(${ads[data].image})`),
                   link: ads[data].link,
                 }
        self.business.push(snap);
        self.LoadingProvider.closeLoading();

        console.log("self.business",self.business);
      }
      if(self.business.length <= 0){
        self.LoadingProvider.closeLoading();
        self.showAdsText = true;
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
