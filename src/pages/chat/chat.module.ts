import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { EmojiPickerModule } from 'ionic-emoji-picker';
@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    EmojiPickerModule.forRoot()
  ],
  exports: [
    ChatPage
  ]
})
export class ChatPageModule {}
