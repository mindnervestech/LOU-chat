var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as Message from '../../providers/message/message';
/**
 * Generated class for the OptionPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var OptionPage = /** @class */ (function () {
    function OptionPage(navCtrl, navParams, alertCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.option = new Array();
        this.TrainOrFliteNumber = "";
        this.optionValue = "";
        this.selectedOption1 = false;
        this.selectedOption2 = false;
        this.selectedOption3 = false;
        this.selectedOption4 = false;
    }
    OptionPage.prototype.ionViewDidLoad = function () {
        var me = this;
        firebase.database().ref().child('option/').on('value', function (optionData) {
            var value = optionData.val();
            for (var data in value) {
                me.option.push(value[data]);
            }
        });
    };
    OptionPage.prototype.selectedValue = function (event, text) {
        if (text == "option1") {
            this.selectedOption1 = event.checked;
        }
        if (text == "option2") {
            this.selectedOption2 = event.checked;
        }
        if (text == "option3") {
            this.selectedOption3 = event.checked;
        }
        if (text == "option4") {
            this.selectedOption4 = event.checked;
        }
    };
    OptionPage.prototype.nextPage = function () {
        var data = {
            option: this.optionValue,
            optionValue: this.TrainOrFliteNumber,
            selectedOption1: this.selectedOption1,
            selectedOption2: this.selectedOption2,
            selectedOption3: this.selectedOption3,
            selectedOption4: this.selectedOption4,
        };
        var me = this;
        if (me.TrainOrFliteNumber != "" && me.optionValue != "") {
            firebase.database().ref('Group').orderByChild("trainNumber").equalTo(me.TrainOrFliteNumber).on('value', function (group) {
                console.log(group.val());
                if (group.val() == null) {
                    var alert_1 = me.alertCtrl.create({ subTitle: "Please enter valid number", buttons: ['OK'] });
                    alert_1.present();
                }
                else {
                    localStorage.setItem("option", JSON.stringify(data));
                    me.navCtrl.setRoot("loginAndTopicInfo", data);
                }
            });
        }
        else {
            var alert_2 = me.alertCtrl.create({ subTitle: Message.FIELD_REQUIRED, buttons: ['OK'] });
            alert_2.present();
        }
    };
    OptionPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-option',
            templateUrl: 'option.html',
        }),
        __metadata("design:paramtypes", [NavController,
            NavParams,
            AlertController])
    ], OptionPage);
    return OptionPage;
}());
export { OptionPage };
//# sourceMappingURL=option.js.map