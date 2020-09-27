import { Component, OnInit } from '@angular/core';
import { DataService } from './services/dataService';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private dataLayer:DataService) { }

  ngOnInit(){
    this.dataLayer.user.number=localStorage.getItem("phone")
    this.dataLayer.user.name=localStorage.getItem("name")
    this.dataLayer.user.pic=localStorage.getItem("pic")
    this.dataLayer.user.about=localStorage.getItem("about");
    this.dataLayer.socket = io.connect("https://infinite-taiga-94128.herokuapp.com/");
    if(this.dataLayer.user.number){
      this.dataLayer.socket.on('connect',  ()=>{
        this.dataLayer.socket.emit('storeClientInfo', { number:this.dataLayer.user.number,socketId:this.dataLayer.socket.id });
      });
    }
  }
}