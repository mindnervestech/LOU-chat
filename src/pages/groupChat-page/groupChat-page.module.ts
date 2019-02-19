import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupChatPage } from './groupChat-page';
import { EmojiPickerModule } from 'ionic-emoji-picker';

@NgModule({
  declarations: [
    GroupChatPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupChatPage),
    EmojiPickerModule.forRoot()
  ],
  exports: [
    GroupChatPage
  ]
})
export class GroupChatPageModule {}
