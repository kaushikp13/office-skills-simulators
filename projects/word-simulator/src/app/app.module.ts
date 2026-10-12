import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SimulatorCoreModule } from 'simulator-core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SimulatorCoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
