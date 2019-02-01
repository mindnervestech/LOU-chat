import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GlobalPage } from './global';

@NgModule({
  declarations: [
    GlobalPage,
  ],
  imports: [
    IonicPageModule.forChild(GlobalPage),
  ],
  exports: [
    GlobalPage
  ]
})
export class GlobalPageModule {}
