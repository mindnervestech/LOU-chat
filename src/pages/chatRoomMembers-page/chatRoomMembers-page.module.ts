import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatRoomMembers } from './chatRoomMembers-page';

@NgModule({
  declarations: [
    ChatRoomMembers,
  ],
  imports: [
    IonicPageModule.forChild(ChatRoomMembers),
  ],
  exports: [
    ChatRoomMembers
  ]
})
export class ChatRoomMembersModule {}
