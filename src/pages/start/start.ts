import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides } from 'ionic-angular';

/**
 * Generated class for the StartPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
	selector: 'page-start',
	   template: `
   <ion-content class="tutorial-page">
   <ion-slides pager>
        <ion-slide class="slider">
             
            <img src="assets/image/banner1.jpg" class="slide-image"/>
            <h2>Select option</h2>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            <div class="bottom-btn">
                <button ion-button small outline class="next" icon-right (click)="slideNext($index)">
                Next
                </button>
                <p style="color: #007aff;" (click)="redirect()">Skip</p>
            </div>
        </ion-slide>
        <ion-slide class="slider">
            <img src="assets/image/banner2.jpg" class="slide-image"/>
            <h2>Search Member</h2>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            <div class="bottom-btn">
                <button ion-button small outline class="next" icon-right (click)="slideNext($index)">
                Next
                </button>
                <p style="color: #007aff;" (click)="redirect()">Skip</p>
            </div>
        </ion-slide>
        <ion-slide class="slider">
            <img src="assets/image/banner3.png" class="slide-image1"/>
            <h2>Connect member</h2>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            <div class="bottom-btn">
                <button ion-button small outline class="next" icon-right (click)="slideNext($index)">
                Get started
                </button>
                <p class="hide-text">sdsds</p>
            </div>
        </ion-slide>
        <ion-slide class="slider" style="display:none;">
            <img src="assets/image/third3.png" class="slide-image1"/>
          
        </ion-slide>
    </ion-slides>
</ion-content>
    `,
})

export class StartPage {
    @ViewChild(Slides) slides: Slides;
	constructor(public navCtrl: NavController, private _zone: NgZone) { }

	ionViewDidLoad() {
        console.log('ionViewDidLoad StartPage');
        
	}

	redirect() {
		// this will redirect to login page when tap to continue button of slider. 
		this.navCtrl.push("OptionPage")
	}

    slideNext($index){
        console.log($index);
        this.slides.slideNext();
        console.log("slide CHANGED", this.slides.getActiveIndex());
        var a= this.slides.getActiveIndex();
        if(a == 3){
            this.redirect();
        }
    }
}
