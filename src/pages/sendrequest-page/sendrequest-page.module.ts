import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendrequestPage } from './sendrequest-page';

@NgModule({
  declarations: [
    SendrequestPage,
  ],
  imports: [
    IonicPageModule.forChild(SendrequestPage),
  ],
  exports: [
    SendrequestPage
  ]
})
export class SendrequestPageModule {}
