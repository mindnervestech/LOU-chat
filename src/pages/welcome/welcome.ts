import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { global } from '../global/global';

/**
 * Generated class for the WelcomePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    global.backPage = "";
  }

  ionViewDidLoad() {
    
  }

  redirect(text) {
    localStorage.setItem("language",text);
    var lan = text.toLowerCase(); 
    localStorage.setItem("lan",lan);
		// this will redirect to login page when tap to continue button of slider.
		this.navCtrl.push("StartPage");
	}
}
