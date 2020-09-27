import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { User } from '../services/models/User.model';
import { DataService } from '../services/dataService';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit {

  constructor(private dataLayer:DataService ,private route: ActivatedRoute,private router: Router,private cdr:ChangeDetectorRef ) { }

  @Input() chatList = [];
  @Input() contactList = [];
  lastDate = "";
  user:User

  ngOnInit() {
    this.user=this.dataLayer.user;
    setTimeout(()=>{
      if(this.dataLayer.chatlistIndex!=null){
        this.generateMessageArea("",this.dataLayer.chatlistIndex)
      }
    })
  }

  generateMessageArea(element , chatIndex){
    element=document.getElementById('chatDiv'+chatIndex)
    if(this.dataLayer.chat){
      if(this.dataLayer.chat.isGroup){
        if(this.chatList[chatIndex].group){
          if(this.dataLayer.chat.group.groupId==this.chatList[chatIndex].group.groupId){
            return
          }
        }
      }
      else{
      if( this.chatList[chatIndex].contact){
        if(this.dataLayer.chat.contact.phone==this.chatList[chatIndex].contact.phone){
           return
         }
       }
      }
    }
    this.dataLayer.chat = this.chatList[chatIndex];
    this.dataLayer.mClassList(document.getElementById("input-area")).contains("d-none", (elem) => elem.remove("d-none").add("d-flex"));
  
    this.dataLayer.mClassList(document.getElementById("message-area").getElementsByClassName("overlay")[0]).add("d-none");

    this.dataLayer.mClassList(document.getElementById("msgnavbar")).remove("d-none").add("d-flex");

    var chat_list_item :any= document.getElementsByClassName("chat-list-item")

    Array.from(chat_list_item).forEach((elem) => this.dataLayer.mClassList(elem).remove("active"));
   
    this.dataLayer.mClassList(element).contains("unread", () => {
      let options={
        isGroup: this.dataLayer.chat.isGroup,
        id: this.dataLayer.chat.isGroup ? this.dataLayer.chat.group.groupId : this.dataLayer.chat.contact.phone
      }

      this.dataLayer.changeStatusById(options,this.dataLayer.messageres);

      if(this.dataLayer.chat.isGroup){
        this.chatList.find(chat=> chat.group?chat.group.groupId== this.dataLayer.chat.group.groupId:chat=="12").unread=0
      }
      else{
        this.chatList.find(chat=> chat.contact?chat.contact.phone== this.dataLayer.chat.contact.phone:chat=="12").unread=0
      }
    });
  
    if (window.innerWidth <= 575) {
      this.dataLayer.mClassList(document.getElementById("chat-list-area")).remove("d-flex").add("d-none");
      this.dataLayer.mClassList(document.getElementById("message-area")).remove("d-none").add("d-flex");
      this.dataLayer.swapArea();
    } 
    else {
      this.dataLayer.mClassList(element).add("active");
    }
  
    document.getElementById("message-area").querySelector('[id=name]').innerHTML = this.dataLayer.chat.name;

    (document.getElementById("message-area").querySelector('[id=pic]') as HTMLImageElement).src = this.dataLayer.chat.isGroup ? this.dataLayer.chat.group.pic : this.dataLayer.chat.contact.pic;
    
    // Message Area details ("last seen ..." for contacts / "..names.." for groups)
      if (this.dataLayer.chat.isGroup ) {
        let groupMembers = this.dataLayer.groupres.find(group => group.groupId === this.dataLayer.chat.group.groupId).members;

        let memberNames='You,';

        memberNames += this.dataLayer.contactres
            .filter(contact => groupMembers.indexOf(contact.phone) !== -1)
            .map(contact =>  contact.name)
            .join(",");

        document.getElementById("message-area").querySelector('[id=msgnavbar]').querySelector('[id=details]').innerHTML= `${memberNames}`;
      } 
      else {
        document.getElementById("message-area").querySelector('[id=msgnavbar]').querySelector('[id=details]').innerHTML= `last seen ${this.dataLayer.mDate(this.dataLayer.chat.contact.lastSeen).lastSeenFormat()}`;
      }

    if(this.dataLayer.chat.isGroup){
      this.router.navigate([], {relativeTo: this.route,queryParams: {group: this.dataLayer.chat.group.groupId,id:null},queryParamsHandling: 'merge'});
    }
    else if(!this.dataLayer.chat.isGroup){
      this.router.navigate([], {relativeTo: this.route,queryParams: {id: this.dataLayer.chat.contact.phone,group:null},queryParamsHandling: 'merge'});
    }
    
   //for first time after creating group there will not be any message initially so "&& this.dataLayer.chat.msg"
    if( this.dataLayer.chat.msg){
      let msgs = this.dataLayer.chat.isGroup ? this.dataLayer.getByGroupId(this.dataLayer.chat.group.groupId,this.dataLayer.messageres) : this.dataLayer.getByContactId(this.dataLayer.chat.contact.phone,this.dataLayer.messageres);

      document.getElementById("messages").innerHTML = "";

      this.dataLayer.emptylastDate();

      msgs
      .sort((a, b) => this.dataLayer.mDate(a.time).subtract(b.time))
      .forEach((msg) => this.dataLayer.addMessageToMessageArea(msg));
    }
  };
}
