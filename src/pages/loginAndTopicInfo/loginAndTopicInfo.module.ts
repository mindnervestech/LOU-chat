import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { loginAndTopicInfo } from './loginAndTopicInfo';

@NgModule({
  declarations: [
    loginAndTopicInfo,
  ],
  imports: [
    IonicPageModule.forChild(loginAndTopicInfo),
  ],
  exports: [
    loginAndTopicInfo
  ]
})
export class LoginPageModule {}
