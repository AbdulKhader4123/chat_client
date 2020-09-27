import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../services/dataService';
import { Message } from '../models/message';
import { Group } from '../models/group';
import { Contact } from '../models/contact';
import { User } from '../services/models/User.model';
import {  ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	title = 'whatsapp';
	loggedIn =false;
	user :User =new User();
	chatList = [];
	contactList:Contact[] =[];
	messages:Message[] =[];
	groupList:Group[] =[];
	areaSwapped = false;

	obs:Subscription
	obs1:Subscription
	obs2:Subscription
 	 constructor(private dataLayer:DataService ,private toastr: ToastrService, private route :ActivatedRoute,private router:Router,private cd:ChangeDetectorRef) { 
	Window["HomeComponent"] = this;
	}

  	ngOnInit() {
	// 'chat' is used to store the current chat
	// which is being opened in the message area
	this.dataLayer.chat = null;
	this.user=this.dataLayer.user;

	this.dataLayer.socket.on('message',(data)=>{
		if(data.message._id!=this.dataLayer.previousMsg){
			this.dataLayer.previousMsg=data.message._id
			this.dataLayer.messageres.push(data.message)
			this.addMessageToMessageArea(data.message);
		}
	})
	
	this.obs=	this.dataLayer.areaSwappedObs.subscribe((res)=>{
		this.areaSwapped=true
	})
	this.obs1=	this.dataLayer.lastDateObs.subscribe((res)=>{
		this.dataLayer.lastDate=''
	});
	this.obs2=	this.dataLayer.updateChatListObs.subscribe((res)=>{
		this.chatList=this.dataLayer.chatList.sort((a, b) => this.dataLayer.mDate(b.msg.time).subtract(a.msg.time))
		//when arrived from contact route
		if(this.route.snapshot.queryParamMap.get('id')){
			let contact=(this.route.snapshot.queryParamMap.get('id'))
			let index=this.chatList.findIndex(chat=>chat.contact?chat.contact.phone==contact:chat=="12")
			this.dataLayer.chatlistIndex=index
			if(index==-1){
				let chat:any={}
				chat.unread=0;
				chat.isGroup=false;
				chat.contact=this.dataLayer.contactres.find((contact1)=>Number(contact1.phone)==Number(contact));
				chat.name=chat.contact.name;
				this.chatList.unshift(chat)
				this.dataLayer.chatlistIndex=0
			}
		}
		if(this.route.snapshot.queryParamMap.get('group')){
			let groupId=(this.route.snapshot.queryParamMap.get('group'))
			let index=this.chatList.findIndex(chat=>chat.group?chat.group.groupId==groupId: chat=="12")
			this.dataLayer.chatlistIndex=index
			if(index==-1){
					let group=this.dataLayer.groupres.find((group)=>Number(group.groupId)==Number(groupId));
					let chat:any={}
					chat.unread=0;
					chat.isGroup=true;
					chat.group=group;
					chat.name=group.name;
					this.chatList.unshift(chat)
					this.dataLayer.chatlistIndex=0
			}
		}
	});

	this.init();

	this.generateChatList();
	
	}	

	init(){
		(document.getElementById("display-pic") as HTMLImageElement).src = this.user.pic;

		document.addEventListener("resize", e => {
		if (window.innerWidth > 575) this.showChatList();
		});
		(document.getElementById('input-about') as HTMLInputElement).value = this.user.about;
		document.getElementById("username").innerHTML = this.user.name;
		(document.getElementById("profile-pic")as HTMLImageElement).src = this.user.pic;
		document.getElementById("profile-pic").addEventListener("click", () => document.getElementById("profile-pic-input").click());
		(document.getElementById("input-name") as HTMLDivElement).addEventListener("blur", (e) => console.log(e));
	}

	generateChatList(){
		this.dataLayer.populateChatList();
	}

	generateMessageArea(elem, chatIndex){
		this.dataLayer.chat = this.chatList[chatIndex];

		this.mClassList(document.getElementById("input-area")).contains("d-none", (elem) => elem.remove("d-none").add("d-flex"));
		this.mClassList(document.getElementById("message-area").getElementsByClassName("overlay")[0]).add("d-none");
		var chat_list_item :any= document.getElementsByClassName("chat-list-item")
		Array.from(chat_list_item).forEach((elem) => this.mClassList(elem).remove("active"));

		this.mClassList(elem).contains("unread", () => {
			this.changeStatusById({
				isGroup: this.dataLayer.chat.isGroup,
				id: this.dataLayer.chat.isGroup ? this.dataLayer.chat.msg.recvId : this.dataLayer.chat.contact.phone
			});
		});

		if (window.innerWidth <= 575) {
			this.mClassList(document.getElementById("chat-list-area")).remove("d-flex").add("d-none");
			this.mClassList(document.getElementById("message-area")).remove("d-none").add("d-flex");
			this.areaSwapped = true;
		} else {
			this.mClassList(elem).add("active");
		}

		document.getElementById("message-area").querySelector('[id=name]').innerHTML = this.dataLayer.chat.name;
		(document.getElementById("message-area").querySelector('[id=pic]') as HTMLImageElement).src = this.dataLayer.chat.isGroup ? this.dataLayer.chat.group.pic : this.dataLayer.chat.contact.pic;
		
		// Message Area details ("last seen ..." for contacts / "..names.." for groups)
		if (this.dataLayer.chat.isGroup) {
			let groupMembers = this.groupList.find(group => group.groupId === this.dataLayer.chat.recvId).members;
			let memberNames = this.contactList
					.filter(contact => groupMembers.indexOf(contact.phone) !== -1)
					.map(contact => contact.phone === this.user.number ? "You" : contact.name)
					.join(", ");
		document.getElementById("message-area").querySelector('[id=navbar]').querySelector('[id=details]').innerHTML= `${memberNames}`;
		
		} 
		else {
			document.getElementById("message-area").querySelector('[id=navbar]').querySelector('[id=details]').innerHTML= `last seen ${this.dataLayer.mDate(this.dataLayer.chat.contact.lastSeen).lastSeenFormat()}`;
		}

		let msgs = this.dataLayer.chat.isGroup ? this.dataLayer.getByGroupId(this.dataLayer.chat.recvId) : this.dataLayer.getByContactId(this.dataLayer.chat.contact.number);

		document.getElementById("messages").innerHTML = "";

		this.dataLayer.lastDate = "";
		msgs
		.sort((a, b) => this.dataLayer.mDate(a.time).subtract(b.time))
		.forEach((msg) => this.addMessageToMessageArea(msg));
	};

	showChatList() {
		if (this.areaSwapped) {
			this.mClassList(document.getElementById("chat-list-area")).remove("d-none").add("d-flex");
			this.mClassList(document.getElementById("message-area")).remove("d-flex").add("d-none");
			this.areaSwapped = false;
		}
	};

	addMessageToMessageArea(msg){
		this.dataLayer.addMessagesFromOthers(msg)
	};

	sendMessage(){
		let value =(document.getElementById("input") as HTMLInputElement).value;
		(document.getElementById("input") as HTMLInputElement).value = "";
		if (value === "") return;
		let msg = {
			sender: this.user.number,
			body: value,
			time: this.dataLayer.mDate("").toString(),
			status: 0,
			recvId: this.dataLayer.chat.isGroup ? this.dataLayer.chat.group.groupId : this.dataLayer.chat.contact.number,
			IsGroup: this.dataLayer.chat.isGroup
		};
		this.dataLayer.socket.emit('message',msg);

		this.addMessageToMessageArea(msg);
	};

	changeStatusById(options){
		var updateStatus=[];
		this.messages = this.messages.map((msg) => {
			var beforeStatus=msg.status;
			if (options.isGroup) {
				if (msg.IsGroup && msg.recvId === options.id) msg.status = "2";
			} else {
				if (!msg.IsGroup && msg.sender === options.id && msg.recvId === this.user.number) msg.status = "2";
			}
			var afterStatus=msg.status;
			if(beforeStatus!=afterStatus){
				updateStatus.push(msg);
			}
			return msg;
		});
		this.dataLayer.updateRead(updateStatus).subscribe((res)=>{
			console.log(res)
		})
	}

	mClassList(element) {
		return {
			add: (className) => {
				element.classList.add(className);
				return this.mClassList(element);
			},
			remove: (className) => {
				element.classList.remove(className);
				return this.mClassList(element);
			},
			contains: (className, callback) => {
				if (element.classList.contains(className))
				callback(this.mClassList(element))
			}
		};
	};

	showContacts(){
		this.router.navigate(['/showContacts'])
	}
	showProfileSettings(){
		document.getElementById("newChat").classList.add("hideelem")
		document.getElementById('profile-settings').style.left="0";
		(document.getElementById('profile-settings')as HTMLImageElement).src = this.user.pic;
		(document.getElementById('input-name') as HTMLInputElement).value = this.user.name;
	};

	hideProfileSettings(){
		document.getElementById("newChat").classList.remove("hideelem")
		document.getElementById('profile-settings').style.left = "-110%";
		document.getElementById('username').innerHTML = this.user.name;
	};

	saveProfile(){

		let name=(document.getElementById('input-name') as HTMLInputElement).value;
		let about=(document.getElementById('input-about') as HTMLInputElement).value;

		if(name!=this.dataLayer.user.name ||  about != this.dataLayer.user.about){
			this.dataLayer.user.name=name;
			this.dataLayer.user.about=about;

			let profile={
				number:this.dataLayer.user.number,
				name:name,
				about:about
			}
			this.dataLayer.saveProfile(profile).subscribe((res)=>{
				if(res=="success"){
				this.toastr.success('Profile Updated Successfully',"",{timeOut: 3000})

				localStorage.setItem("name",name);
				localStorage.setItem("about",about);
				}
			})
		}
	}

	logOut(){
	this.dataLayer.user=null;
	localStorage.removeItem("name");
	localStorage.removeItem("phone");
	localStorage.removeItem("about");
	localStorage.removeItem("pic");
	this.router.navigate(['/login'])

	}

	ngOnDestroy(){
		this.obs.unsubscribe();
		this.obs1.unsubscribe();
		this.obs2.unsubscribe();
	}
}

