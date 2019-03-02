import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides } from 'ionic-angular';
import { global } from '../global/global';
import { TranslateService } from '@ngx-translate/core';
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
        <ion-slide class="slider" style="background:url('assets/image/select trip_screen_bg.png');background-size: 100% 100%;">
            <h2>{{ 'Select your' | translate }} <span>{{ 'trip' | translate }}</span></h2>
            <div class="bottom-btn">
                <button ion-button small outline class="next" icon-right (click)="slideNext($index)">
                {{ 'Next' | translate }}
                </button>
                <p style="color: #330c69;" (click)="redirect()">{{ 'Skip' | translate }}</p>
            </div>
        </ion-slide>
        <ion-slide class="slider" style="background:url('assets/image/define_favorite_screen_bg.png');background-size: 100% 100%;">
            <!--<img src="assets/image/banner2.jpg" class="slide-image"/>
            <h2>Define your favorite topics</h2>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>-->
            <div class="define"><p>{{ 'Define your' | translate}}</p> <span [ngClass]="{'fav': langStyle == 'fn'}">{{ 'favorite' | translate }}</span> <p>{{ 'topics' | translate }}</p></div>
            <div class="bottom-btn">
                <button ion-button small outline class="next" icon-right (click)="slideNext($index)">
                {{ 'Next' | translate }}
                </button>
                <p style="color: #330c69;" (click)="redirect()">{{ 'Skip' | translate }}</p>
            </div>
        </ion-slide>
        <ion-slide class="slider" style="background:url('assets/image/receive_matches_screen_bg.png');background-size: 100% 100%;">
            <!--<img src="assets/image/banner3.png" class="slide-image1"/>
            <h2>Receive matches</h2>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>-->
            <div class="define"><p style="margin-left: -40px;margin-bottom: -6px;">{{ 'Receive' | translate }}</p> <span>{{ 'Matches' | translate }}</span></div>
            <div class="bottom-btn">
                <button ion-button small outline class="next" icon-right (click)="slideNext($index)">
                {{ 'Next' | translate }}
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
    langStyle: string = '';
	constructor(public navCtrl: NavController, private _zone: NgZone,public translate: TranslateService) { 
        global.backPage = "";
    }

	ionViewDidLoad() {

	}
    ionViewDidEnter(){
        console.log("ionViewDidEnter")
        this.getLang();
    }
    getLang(){
        var lang = localStorage.getItem('lan');
        this.translate.use(lang);           
        console.log("lang",lang);
        this.langStyle = lang;
    }
	redirect() {
		// this will redirect to login page when tap to continue button of slider. 
		this.navCtrl.push("OptionPage")
	}

    slideNext($index){
        this.slides.slideNext();
        var a= this.slides.getActiveIndex();
        if(a == 3){
            this.redirect();
        }
    }
}
