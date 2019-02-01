import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddMembersPage } from './addMembers-page';

@NgModule({
  declarations: [
    AddMembersPage,
  ],
  imports: [
    IonicPageModule.forChild(AddMembersPage),
  ],
  exports: [
    AddMembersPage
  ]
})
export class AddMembersPageModule {}
