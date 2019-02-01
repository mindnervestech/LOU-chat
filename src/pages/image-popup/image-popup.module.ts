import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagePopupPage } from './image-popup';

@NgModule({
  declarations: [
    ImagePopupPage,
  ],
  imports: [
    IonicPageModule.forChild(ImagePopupPage),
  ],
  exports: [
    ImagePopupPage
  ]
})
export class ImagePopupPageModule {}
