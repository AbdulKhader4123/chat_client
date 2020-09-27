import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Contact } from '../models/contact';
import { Group } from '../models/group';
import { Message } from '../models/message';
import { User } from './models/User.model';
import { Subject } from 'rxjs/internal/Subject';
import { forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService{
    constructor(private http:HttpClient){
    }
    constants={
        group: {
            group_created: "Group created sucessfully",
        },
    }
    socket;
    contactres :Contact[] =[]
    groupres : Group[]=[]
    messagesrestemp: Message[]=[]
    messagesrestemp1: Message[]=[]
    messageres : Message[]=[]
    userGroupIds:any=[];
    groupDetails: Group;
    user :User =new User();
    lastDate=""
    chat;
    chatList = [];
    messageObj:any={};
    chatlistIndex :number=null;
    previousMsg;

    private areaSwapped = new Subject<string>();
    areaSwappedObs = this.areaSwapped.asObservable();

    private lastDateSub = new Subject<string>();
    lastDateObs = this.lastDateSub.asObservable();

    private updateChatListSub = new Subject<string>();
    updateChatListObs = this.updateChatListSub.asObservable();

    getMessages(){
        return this.http.get("api/chat/getmessages")
    }
    getGroups(){
        return this.http.get("api/chat/getgroups")
    }
    getUserGroupIds(){
        return this.http.post("api/chat/getUserGroupIds",{phone:this.user.number})
    }
    getContacts(){
        return this.http.get("api/chat/getContacts")
    }
    updateRead(updatedStatus){
        return this.http.post("api/chat/updateRead",{updatedStatus:updatedStatus})
    }
    createGroup(groupDetails:Group){
        this.groupDetails=groupDetails;
        return this.http.post("api/chat/createGroup",{groupDetails:groupDetails})
    }
    saveProfile(updatedProfile){
        return this.http.post("api/user/saveProfile",{updatedProfile:updatedProfile})
    }
    swapArea(){
        this.areaSwapped.next("")
    }
    emptylastDate(){
        this.lastDateSub.next("")
    }
    updateChatList(){
        this.updateChatListSub.next("")
    }
    mDate(dateString)  {
	
        let date :any = dateString ? new Date(dateString) : new Date();
    
        let newDate :any =new Date();
        let dualize = (x) => x < 10 ? "0" + x : x;
        let getTime = () => newDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        let getDate = () => dualize(date.getDate()) + "/" + dualize(date.getMonth()+1) + "/" + dualize(date.getFullYear());
        return {
            subtract: (otherDateString) => {
              otherDateString= new Date(otherDateString);
                return (date  - otherDateString);
            },
            lastSeenFormat: () => {
                let dateDiff = Math.round(newDate - date) / (1000 * 60 * 60 * 24);
                let value = (dateDiff === 0) ? "today" : (dateDiff === 1) ? "yesterday" : getDate();
                return value + " at " + getTime();
            },
            chatListFormat: () => {
                let dateDiff = Math.round((newDate - date) / (1000 * 60 * 60 * 24));
                if (dateDiff === 0) {
                    return getTime();
                } else if (dateDiff === 1) {
                    return "Yesterday";
                } else {
                    return getDate();
                }
            },
            messageFormat: () => {
                return  date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            },
            getDate: () => {
                return getDate();
            },
            getTime: () => {
                return getTime();
            },
            toString:() => {
                return date.toString().substr(4, 20);
            },
            toString1:() => {
                return date.toString().substr(16,8);
            },
        };
    };
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
                    callback(this.mClassList(element));
                   callback(this.mClassList(element))
            }
        };
    };
    changeStatusById(options,messages?){
        var updateStatus=[];
        messages = messages.map((msg) => {
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
        if(updateStatus.length>0){
            this.updateRead(updateStatus).subscribe((res)=>{
                console.log(res)
            })
        }
    }
    getByGroupId(groupId,messages?){
        return messages.filter(msg => msg.IsGroup && msg.recvId == groupId);
    };

    getByContactId(contactId,messages?){
        return messages.filter(msg => {
            return !msg.IsGroup && ((msg.sender == this.user.number && msg.recvId ==contactId) || (msg.sender == contactId && msg.recvId == this.user.number));
        });
    };
    
    addMessageToMessageArea(msg,current?){
        let msgDate = this.mDate(msg.time).getDate();
        if (this.lastDate != msgDate) {
            this.addDateToMessageArea(msgDate);
            this.lastDate = msgDate;
        }
        let htmlForGroup = `
        <div class="small font-weight-bold text-primary">
            ${this.contactres.find(contact => contact.phone === msg.sender)!=undefined?this.contactres.find(contact => contact.phone === msg.sender).name:""}
        </div>
        `;
        let sendStatus = `<i class="${msg.status < 2 ? "far" : "fas"} fa-check-circle"></i>`;
        document.getElementById("messages").innerHTML += `
        <div class="align-self-${msg.sender === this.user.number ? "end self" : "start"} p-1 my-1 mx-3 rounded bg-white shadow-sm message-item">
            <div class="options">
                <a ><i class="fas fa-angle-down text-muted px-2"></i></a>
            </div>
            ${this.chat.isGroup ? htmlForGroup : ""}
            <div class="d-flex flex-row">
                <div class="body m-1 mr-2">${msg.body}</div>
                <div class="time ml-auto small text-right flex-shrink-0 align-self-end text-muted" style="width:75px;">
                    ${this.mDate(msg.time).messageFormat()}
                    ${(msg.sender === this.user.number) ? sendStatus : ""}
                </div>
            </div>
        </div>
        `;

        document.getElementById("messages").scrollTo(0,document.getElementById("messages").scrollHeight);

        if(current){
            if(this.chat.isGroup){
                let foundIndex = this.chatList.findIndex(chat =>chat.group?chat.group.groupId==msg.recvId:chat=="12");
                if(foundIndex>=0){
                    let newMessage=this.chatList[foundIndex]
                    newMessage.msg=msg;
                    this.chatList[foundIndex]=newMessage
                    if(current){
                        let chat= this.chatList.splice(foundIndex,1);
                        this.chatList.unshift(chat[0])
                    }
                }
            }
            else{
                let foundIndex = this.chatList.findIndex(chat =>chat.contact?chat.contact.phone==msg.recvId:chat=="12");
                if(foundIndex>=0){
                    let newMessage=this.chatList[foundIndex]
                    newMessage.msg=msg;
                    this.chatList[foundIndex]=newMessage
                    if(current){
                        let chat= this.chatList.splice(foundIndex,1);
                        this.chatList.unshift(chat[0])
                    }
                }
            }
        }
        if(current){
        this.messageres.push(msg)
        }
    };
    addDateToMessageArea(date){
        document.getElementById("messages").innerHTML += `
        <div class="mx-auto my-2 bg-primary text-white small py-1 px-2 rounded">
            ${date}
        </div>
        `;
    };
    populateChatList(){
        if(this.contactres.length==0||this.messageres.length==0){
            let contacts= this.getContacts();
            let groups= this.getGroups();
            let messages =this.getMessages();
            let userGroupIds=this.getUserGroupIds()

            forkJoin([contacts, groups,messages,userGroupIds]).subscribe((results:any)=> {
                this.contactres=results[0];
                this.groupres=results[1];
                this.messageres=results[2];
                this.userGroupIds=results[3];
                this.contactres=this.contactres.filter((contact)=>contact.phone!=localStorage.getItem("phone"))
                this.populateChat();
            });
        }
        else{
            this.populateChat();
        }
    }
    populateChat(){
        this.chatList.length=0
        let present = {};
        //to fetch messages if user number falls in sent or received message
        this.messagesrestemp=this.messageres.filter((msg)=>{
            return (msg.recvId==this.user.number || msg.sender==this.user.number)
         })
        //to fetch messages if user belongs to particular group and his number not comes under in sent or received message
         this.messagesrestemp1= this.messageres.filter((msg)=>{
            return (msg.sender!=this.user.number && this.userGroupIds.indexOf(Number(msg.recvId))>=0)
         })

        this.messagesrestemp= this.messagesrestemp.concat(this.messagesrestemp1);

        this.messagesrestemp
        .sort((a, b) => this.mDate(a.time).subtract(b.time))
        .forEach((msg) => {

            let chat = {};
            chat["isGroup"] = msg.IsGroup;
            chat["msg"] = msg;
    
    
            if (msg.IsGroup) {
                chat["group"] = this.groupres.find((group) => (group.groupId == msg.recvId));
                chat["name"] = chat['group']!=null?chat['group'].name:"";
            } else {
                chat["contact"] = this.contactres.find((contact) => (msg.sender !== this.user.number) ? (contact.phone === msg.sender) : (contact.phone === msg.recvId));
                chat["name"] = chat["contact"]!=null?chat["contact"].name:""
            }
    
            chat["unread"] = (msg.sender !== this.user.number && parseInt(msg.status) < 2) ? 1: 0;
            if (present[chat["name"]] !== undefined) {
                this.chatList[present[chat["name"]]].msg = msg;
                this.chatList[present[chat["name"]]].unread += chat["unread"];
            } else {
                present[chat["name"]] = this.chatList.length;
                this.chatList.push(chat);
            }
        });
    this.updateChatList();
    }

    addMessagesFromOthers(msg){
        let msgDate = this.mDate(msg.time).getDate();
        if (this.lastDate != msgDate) {
            this.addDateToMessageArea(msgDate);
            this.lastDate = msgDate;
        }
        //if we receive messages and to check whether our messagewindow is opened
        if(this.chat){
            // group chat is opened
            if(this.chat.isGroup){
                //does recvd msg belongs to  group chat
                if(msg.IsGroup){
                //does recvd msg belongs to current opened group chat
                    if(this.chat.group.groupId==msg.recvId){
                        this.addMessages(msg);
                        this.updateGroupMsg(msg,true)
                    }
                    else{
                    //else update group chat in chatlist
                        this.updateGroupMsg(msg)
                    }
                }
                else{
                    //else update chat in chatlist
                    this.updateMsg(msg);
                }
            }
            else{
                // recvd msg belongs to normal chat
                if(!msg.IsGroup){
                    //does recvd msg belongs to current opened normal chat
                        if(this.chat.contact.phone==msg.sender){
                            this.addMessages(msg);
                            this.updateMsg(msg,true);
                        }
                        else{
                        //else update chat in chatlist
                        this.updateMsg(msg);
                        }
                    }
                    else{
                        //else update group chat in chatlist
                        this.updateGroupMsg(msg)
                    }
            }
        }
        else{
            if(msg.IsGroup ){
            this.updateGroupMsg(msg)
            }
            else
            {
                this.updateMsg(msg);
            }
            }
    }
    updateGroupMsg(msg,arg?){
        let foundIndex = this.chatList.findIndex(chat =>chat.group?chat.group.groupId==msg.recvId:chat==1);
            
        if(foundIndex>=0){
            let newMessage=this.chatList[foundIndex]
            newMessage.msg=msg;
            if(!arg){
                newMessage.unread+=1;
            }
            this.chatList[foundIndex]=newMessage
            let chat= this.chatList.splice(foundIndex,1);
            this.chatList.unshift(chat[0])
        }
        //receiving from others for first time
        else{
            //making sure its from group
            if(msg.IsGroup){
                this.getGroups().subscribe((res:any)=>{
                    this.groupres=res;
                    let chat:any={}
                    chat.unread=1;
                    chat.isGroup=true;
                    chat.group=this.groupres.find((group)=>group.groupId==msg.recvId);
                    chat.name=chat.group.name;
                    chat.msg=msg
                    this.chatList.unshift(chat)
                })
            }
        }
    }
    updateMsg(msg,arg?){

        let foundIndex = this.chatList.findIndex(chat =>chat.contact?chat.contact.phone==msg.sender:chat==1);
            
        if(foundIndex>=0){
            let newMessage=this.chatList[foundIndex]
            newMessage.msg=msg;
            if(!arg){
                newMessage.unread+=1;
            }
            this.chatList[foundIndex]=newMessage
            let chat= this.chatList.splice(foundIndex,1);
            this.chatList.unshift(chat[0])
        }
        //receiving from others for first time
        else{
            //making sure its from group
            if(!msg.IsGroup){
                this.getContacts().subscribe((res:any)=>{
                    this.contactres=[...res];
                    let chat:any={}
                    chat.unread=1;
                    chat.isGroup=false;
                    chat.contact=this.contactres.find((contact1)=>Number(contact1.phone)==msg.sender);
                    chat.name=chat.contact.name;
                    chat.msg=msg
                    this.chatList.unshift(chat)
                });
            }
        }
    }
    addMessages(msg){

        let htmlForGroup = `
        <div class="small font-weight-bold text-primary">
            ${this.contactres.find(contact => contact.phone === msg.sender)!=undefined?this.contactres.find(contact => contact.phone === msg.sender).name:""}
        </div>
        `;

        let sendStatus = `<i class="${msg.status < 2 ? "far" : "fas"} fa-check-circle"></i>`;
        document.getElementById("messages").innerHTML += `
        <div class="align-self-${msg.sender === this.user.number ? "end self" : "start"} p-1 my-1 mx-3 rounded bg-white shadow-sm message-item">
            <div class="options">
                <a ><i class="fas fa-angle-down text-muted px-2"></i></a>
            </div>
            ${this.chat.isGroup ? htmlForGroup : ""}
            <div class="d-flex flex-row">
                <div class="body m-1 mr-2">${msg.body}</div>
                <div class="time ml-auto small text-right flex-shrink-0 align-self-end text-muted" style="width:75px;">
                    ${this.mDate(msg.time).messageFormat()}
                    ${(msg.sender === this.user.number) ? sendStatus : ""}
                </div>
            </div>
        </div>
        `;
        document.getElementById("messages").scrollTo(0,document.getElementById("messages").scrollHeight);
    }
}