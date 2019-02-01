import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
/**
 * Generated class for the ImagePopupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-image-popup',
  templateUrl: 'image-popup.html',
})
export class ImagePopupPage {
src :any;
  constructor( public _DomSanitizer: DomSanitizer,public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
   this.src  = navParams.get('imageSrc');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImagePopupPage');
  }
 

 popupDismiss(event) {
    this.viewCtrl.dismiss();
  }
}
