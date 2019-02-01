import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewrequestPage } from './newrequest-page';

@NgModule({
  declarations: [
    NewrequestPage,
  ],
  imports: [
    IonicPageModule.forChild(NewrequestPage),
  ],
  exports: [
    NewrequestPage
  ]
})
export class NewrequestPageModule {}
