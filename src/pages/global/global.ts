import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the GlobalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-global',
  templateUrl: 'global.html',
})
export class GlobalPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GlobalPage');
  }

}
export var global = {
  USER_NAME: "",
  USER_IMAGE: "",
  USER_ACCESS_CODE: "",
  Is_CHAT_PAGE:false,
  backPage:"",
  page: "",
  singleChatUserKey: "",
  singleChatData: new Array(),
}

