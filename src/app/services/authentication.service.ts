import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from './models/User.model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService   implements OnInit{

loggedUser:string
  
constructor(private http: HttpClient,private route:Router) {
}
 
ngOnInit() {
}

doLoginUser(user: User) {
  this.loggedUser = user.number;
  localStorage.setItem("phone",user.number);
  localStorage.setItem("name",user.name);
  localStorage.setItem("pic",user.pic);
  localStorage.setItem("about",user.about);
}

}