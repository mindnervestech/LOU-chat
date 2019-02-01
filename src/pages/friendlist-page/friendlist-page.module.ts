import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendlistPage } from './friendlist-page';

@NgModule({
  declarations: [
    FriendlistPage,
  ],
  imports: [
    IonicPageModule.forChild(FriendlistPage),
  ],
  exports: [
    FriendlistPage
  ]
})
export class FriendlistPageModule {}
