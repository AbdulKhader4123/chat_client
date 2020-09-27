import { Component, OnInit } from '@angular/core';
import { Contact } from '../models/contact';
import { DataService } from '../services/dataService';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'show-contacts',
  templateUrl: './show-contacts.component.html',
  styleUrls: ['./show-contacts.component.css']
})
export class ShowContactsComponent implements OnInit {

  constructor(private dataLayer:DataService,private router:Router) { }
  contactList:Contact[] =[];
  obs:Subscription

  ngOnInit() {
    this.dataLayer.chat=null;
    if(this.dataLayer.contactres.length==0){
      this.dataLayer.getContacts().subscribe((res:any)=>{
        this.dataLayer.contactres=[...res];
        this.contactList=[...this.dataLayer.contactres];
        this.contactList=this.contactList.filter((contact)=>contact.phone!=localStorage.getItem("phone"))
      });
     }
     else{
      this.contactList=[...this.dataLayer.contactres];
     }
     this.contactList.sort()
     this.obs=	this.dataLayer.updateChatListObs.subscribe((res)=>{
      this.generateMessage();
		});
  }

   generateMessageAreaForContact(elem,chatName,chatNumber,chatPic,chatLastSeen){
    elem=document.getElementById(elem)
    this.dataLayer.messageObj={
      elem,chatName,chatNumber,chatPic,chatLastSeen
    }
	  this.router.navigate(['/home'],{queryParams:{id:chatNumber}})
  }

  generateMessage(){
    let{elem,chatName,chatNumber,chatPic,chatLastSeen}=this.dataLayer.messageObj;
    //to check from chatlist with only normal chats
    this.dataLayer.chat=this.dataLayer.chatList.filter(chat=>chat.isGroup==false)
    .find(chat=>chat.contact.phone==chatNumber)

    //if a  chat exists already
    if(this.dataLayer.chat){
    
      this.dataLayer.mClassList(document.getElementById("input-area")).contains("d-none", (elem) => elem.remove("d-none").add("d-flex"));
    
      this.dataLayer.mClassList(document.getElementById("message-area").getElementsByClassName("overlay")[0]).add("d-none");
     this.dataLayer.mClassList(document.getElementById("msgnavbar")).remove("d-none").add("d-flex");

      var chat_list_item :any= document.getElementsByClassName("chat-list-item")
      Array.from(chat_list_item).forEach((elem) => this.dataLayer.mClassList(elem).remove("active"));
    
      this.dataLayer.mClassList(elem).contains("unread", () => {
        this.dataLayer.changeStatusById({
          isGroup: this.dataLayer.chat.isGroup,
          id: this.dataLayer.chat.isGroup ? this.dataLayer.chat.msg.recvId : this.dataLayer.chat.contact.phone
        });
      });
    
      if (window.innerWidth <= 575) {
        this.dataLayer.mClassList(document.getElementById("chat-list-area")).remove("d-flex").add("d-none");
        this.dataLayer.mClassList(document.getElementById("message-area")).remove("d-none").add("d-flex");
        this.dataLayer.swapArea();
      } 
      else {
        this.dataLayer.mClassList(elem).add("active");
      }
    
      document.getElementById("message-area").querySelector('[id=name]').innerHTML = this.dataLayer.chat.name;
      (document.getElementById("message-area").querySelector('[id=pic]') as HTMLImageElement).src = this.dataLayer.chat.isGroup ? this.dataLayer.chat.group.pic : this.dataLayer.chat.contact.pic;
    
      // Message Area details ("last seen ..." for contacts / "..names.." for groups)
      if (this.dataLayer.chat.isGroup) {
        let groupMembers = this.dataLayer.groupres.find(group => group.groupId === this.dataLayer.chat.recvId).members;
        let memberNames = this.contactList
            .filter(contact => groupMembers.indexOf(contact.phone) !== -1)
            .map(contact => contact.phone === localStorage.getItem("phone") ? "You" : contact.name)
            .join(", ");
      document.getElementById("message-area").querySelector('[id=msgnavbar]').querySelector('[id=details]').innerHTML= `${memberNames}`;
    
      } 
      else {
        document.getElementById("message-area").querySelector('[id=msgnavbar]').querySelector('[id=details]').innerHTML= `last seen ${this.dataLayer.mDate(this.dataLayer.chat.contact.lastSeen).lastSeenFormat()}`;
      }
    
      let msgs = this.dataLayer.chat.isGroup ? this.dataLayer.getByGroupId(this.dataLayer.chat.recvId,this.dataLayer.messageres) : this.dataLayer.getByContactId(this.dataLayer.chat.contact.phone,this.dataLayer.messageres);
      document.getElementById("messages").innerHTML = "";
    
      this.dataLayer.lastDate = "";
      msgs
      .sort((a, b) => this.dataLayer.mDate(a.time).subtract(b.time))
      .forEach((msg) => this.dataLayer.addMessageToMessageArea(msg));
      }
    else{
      this.dataLayer.chat={}
      this.dataLayer.chat.contact={}
      this.dataLayer.chat.name=chatName;
      this.dataLayer.chat.contact.phone=chatNumber;
      this.dataLayer.chat.isGroup=false;
      this.dataLayer.mClassList(document.getElementById("input-area")).contains("d-none", (elem) => elem.remove("d-none").add("d-flex"));
  
    this.dataLayer.mClassList(document.getElementById("message-area").getElementsByClassName("overlay")[0]).add("d-none");
    this.dataLayer.mClassList(document.getElementById("msgnavbar")).remove("d-none").add("d-flex");
    var chat_list_item :any= document.getElementsByClassName("chat-list-item")
    Array.from(chat_list_item).forEach((elem) => this.dataLayer.mClassList(elem).remove("active"));
  
    if (window.innerWidth <= 575) {
      this.dataLayer.mClassList(document.getElementById("chat-list-area")).remove("d-flex").add("d-none");
      this.dataLayer.mClassList(document.getElementById("message-area")).remove("d-none").add("d-flex");
      this.dataLayer.swapArea();
    } else {
      this.dataLayer.mClassList(elem).add("active");
    }
  
    document.getElementById("message-area").querySelector('[id=name]').innerHTML = chatName;
    (document.getElementById("message-area").querySelector('[id=pic]') as HTMLImageElement).src = chatPic
    
    document.getElementById("message-area").querySelector('[id=msgnavbar]').querySelector('[id=details]').innerHTML= `last seen ${this.dataLayer.mDate(chatLastSeen).lastSeenFormat()}`;
    
    document.getElementById("messages").innerHTML = "";
  
    this.dataLayer.lastDate = "";
    }
  }

  goToHome(){
  this.router.navigate(['/home'])
  }

  ngOnDestroy(){
    this.obs.unsubscribe();
  }
}
