import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NewGroupComponent } from './new-group/new-group.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { DisplaynumberPipe } from './displaynumber.pipe';
import { DateformatPipe } from './dateformat.pipe';
import { MessagewindowComponent } from './messagewindow/messagewindow.component';
import { ShowContactsComponent } from './show-contacts/show-contacts.component';
import { ToastrModule } from 'ngx-toastr';
import { TokenInterceptor } from './auth/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    NewGroupComponent,
    ChatListComponent,
    DisplaynumberPipe,
    DateformatPipe,
    MessagewindowComponent,
    ShowContactsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,ReactiveFormsModule,
    ToastrModule.forRoot(), 
  ],
  providers: [
     {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
