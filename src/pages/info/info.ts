import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    var title = JSON.parse(localStorage.getItem("Group"));
    this.titleName = title.groupName;
    console.log('this.titleName',this.titleName);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoPage');
    this.adPage = true;
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

}
