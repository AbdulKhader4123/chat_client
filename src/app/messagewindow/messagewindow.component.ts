import { Component, OnInit} from '@angular/core';
import { DataService } from '../services/dataService';

@Component({
  selector: 'messagewindow',
  templateUrl: './messagewindow.component.html',
  styleUrls: ['./messagewindow.component.css']
})
export class MessagewindowComponent implements OnInit {

  constructor(private dataLayer:DataService ) { }

  ngOnInit() {
  }

  showChatList(){
    this.dataLayer.mClassList(document.getElementById("chat-list-area")).remove("d-none").add("d-flex");
    this.dataLayer.mClassList(document.getElementById("message-area")).remove("d-flex").add("d-none");
    this.dataLayer.swapArea();
  }

  sendMessage(){
    let value =(document.getElementById("input") as HTMLInputElement).value;
    (document.getElementById("input") as HTMLInputElement).value = "";
    if (value === "") return;
    let msg = {
      sender: this.dataLayer.user.number,
      body: value,
      time: this.dataLayer.mDate("").toString(),
      status: 0,
      recvId: this.dataLayer.chat.isGroup ? this.dataLayer.chat.group.groupId : this.dataLayer.chat.contact.phone,
      IsGroup: this.dataLayer.chat.isGroup
    };
    this.dataLayer.socket.emit('message',msg);
  
    this.dataLayer.addMessageToMessageArea(msg,true);
  };
}
