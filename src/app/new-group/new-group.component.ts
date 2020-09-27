import { Component, OnInit } from '@angular/core';
import { Contact } from '../models/contact';
import { DataService } from '../services/dataService';
import { AuthenticationService } from '../services/authentication.service';
import { Group } from '../models/group';
import { HomeComponent } from '../home/home.component';
import { Router } from '@angular/router';

@Component({
  selector: 'new-group',
  templateUrl: './new-group.component.html',
  styleUrls: ['./new-group.component.css']
})
export class NewGroupComponent implements OnInit {

  constructor(private dataLayer:DataService, private auth:AuthenticationService,private router:Router) { 
	Window["NewGroupComponent"] = this;
  }

  contactList:Contact[] =[];

  async ngOnInit() {
    document.getElementById("toast").classList.add("hideelem")

    if(this.dataLayer.contactres.length==0){
      this.dataLayer.contactres=await this.dataLayer.getContacts().toPromise().then();
    }
    this.dataLayer.contactres=this.dataLayer.contactres.filter((contact)=>contact.phone!=localStorage.getItem("phone"))
    this.contactList=[...this.dataLayer.contactres]
    this.showContacts();
  }

  showContacts(){
    var childelements =document.getElementById("contact-list-area").children;

    document.getElementById("contact-list").innerHTML="";
    
    this.contactList
    .sort()
    .forEach((elem, index) => {
    document.getElementById("contact-list").innerHTML +=(`
    <div class="chat-list-item d-flex flex-row w-100 p-2 " id="div_${index}" onclick =" Window.NewGroupComponent.addToGroup(this)">
        <img src="${ elem.pic}" alt="Profile Photo" id="img_${index}" class="img-fluid rounded-circle" style="height:50px;width:14%;margin-right:0.5rem !important">
        <img id="img1_${index}" class="check1 img-fluid rounded-circle hideelem" src="/assets/green-checkbox-icon-7.jpg" >
        <div >
          <div class="name  font-weight-bold">${elem.name}</div>
          <div class="small last-message">${elem.about}</div>
        </div>
      </div>
    `)
    })
  }
  
  searchBar(){
    document.getElementById("searchIcon").classList.add('whiteSearch') ;
    setTimeout(() => {
      document.getElementById("navbarContact").classList.add("hideelem");
      document.getElementById("navbarSearch").classList.remove("hideelem");
      document.getElementById("search-name").focus();
    }, 500);
  }

  removeSearch(){
    document.getElementById("navbarSearch").classList.add("hideelem");
    document.getElementById("navbarContact").classList.remove("hideelem");
    document.getElementById("searchIcon").classList.remove('whiteSearch') ;
  }

  filterSearch(){
    var inputValue = (document.getElementById("search-name") as HTMLInputElement).value;
    inputValue=inputValue.toLowerCase().trim();
    var childnodes= document.getElementById("contact-list").children
    Array.from(childnodes).forEach((elem)=>{
      if(elem.lastElementChild.children[0].textContent.toLowerCase().trim().indexOf(inputValue)>-1){
        document.getElementById(elem.id).classList.remove("hideelem")
      }
      else{
        document.getElementById(elem.id).classList.add("hideelem")
      }
    })
  }

  addToGroup(elem){
    document.getElementById("selectedContacts").classList.remove("hideelem");

    document.getElementById(elem.firstElementChild.id).nextElementSibling.classList.toggle("hideelem")
    var count=0;
    var id="";
    var childnodes= document.getElementById("selectedContacts").children
    Array.from(childnodes).forEach((elem1)=>{
      if(elem1.id.split('|')[1]==elem.id){
      count+=1;
      id=elem1.id;
      }
    })
    if(count==0){
          document.getElementById("selectedContacts").innerHTML += (`<div class="d-flex flex-column" id="div|${elem.id}" style="position:relative" onclick ="Window.NewGroupComponent.removeFromGroup('div|${elem.id}')">
      <img src="${ elem.firstElementChild.src}" alt="Profile Photo" id="img2_${elem.firstElementChild.id}" class="img-fluid rounded-circle" style="height:60px;width:70px;margin-right:0.5rem !important">
      <img id="img3_${elem.firstElementChild.id}" class="check2 img-fluid rounded-circle " src="/assets/Button Close.png" >
      <div class="small belowname ">${elem.lastElementChild.children[0].textContent}</div></div>`) 

      document.getElementById("GroupContacts").innerHTML  +=  (`<div class="d-flex flex-column" id="div1|${elem.id}" style="position:relative" >
      <img src="${ elem.firstElementChild.src}" alt="Profile Photo" id="img4_${elem.firstElementChild.id}" class="img-fluid rounded-circle" style="height:60px;width:70px;margin-right:0.5rem !important">
      <div class="small belowname ">${elem.lastElementChild.children[0].textContent}</div></div>`) 
    }
    else{
      document.getElementById(id).remove()
      document.getElementById("div1|"+elem.id).remove()

      if(document.getElementById("selectedContacts").children.length==0){
        document.getElementById("selectedContacts").classList.add("hideelem");
      }
    }
    var x=document.getElementById("selectedContacts").scrollLeft;
    document.getElementById("selectedContacts").scrollLeft=x+100
  }

  removeFromGroup(id){
    document.getElementById(id.split('|')[1]).children[1].classList.toggle("hideelem")

    document.getElementById(id).remove()
    document.getElementById("div1|"+id.split('|')[1]).remove()

    if(document.getElementById("selectedContacts").children.length==0){
      document.getElementById("selectedContacts").classList.add("hideelem");
    }
  }

  createGroup(){
    if(document.getElementById("selectedContacts").children.length==0){
      document.getElementById("toast").classList.remove("hideelem")
      setTimeout(() => {
      document.getElementById("toast").classList.add("hideelem")
        
      }, 2300);
    }
    else{
      document.getElementById('profile-settings1').style.right="0";
    }
  }

  hideGroup(){
    this.router.navigate(['/home'])
  }

  createNewGroup(){
    var members=[];
    var childnodes= document.getElementById("GroupContacts").children
    Array.from(childnodes).forEach((elem)=>{
    members.push(this.contactList.find(contact=>contact.name==elem.lastElementChild.textContent).phone)
    })

    members.push(localStorage.getItem("phone"))
    let response={
      name:(document.getElementById('searchname1') as HTMLInputElement).value,
      members:members,
      created:this.dataLayer.mDate("").toString(),
      createdBy:(localStorage.getItem("phone")),
      admins:[localStorage.getItem("phone")],
    }
    let group:Group=new Group(response);

    this.dataLayer.createGroup(group).subscribe((res)=>{
      if(res['msg']==this.dataLayer.constants.group.group_created){
        this.dataLayer.groupres.push(res['group'])
        this.router.navigate(['/home'],{queryParams:{group:res['group'].groupId}})
      }
    });
  }
}
