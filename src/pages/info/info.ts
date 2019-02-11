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
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoPage');
    this.adPage = true;
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
