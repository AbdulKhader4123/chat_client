import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from '../custom-validators';
import { LoginService } from '../services/login.service';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../services/models/User.model';
import { DataService } from '../services/dataService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  submitted=false;
  LoginForm :FormGroup;

  param:string="";
  ResetPass:string="";


  constructor(private formbuilder :FormBuilder,private router:Router,private loginService:LoginService,private authService:AuthenticationService,private dataLayer:DataService) { }

  ngOnInit() {
    this.LoginForm=this.formbuilder.group({
    phone:["",Validators.compose([Validators.required, Validators.maxLength(10)])],
    password: ['', Validators.compose([Validators.required,Validators.minLength(8),
      CustomValidators.patternValidator(/\d/, { hasNumber: true }),
      CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
      CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
    ])],
    })

    document.getElementById("icon").addEventListener("click", () => {

      if(document.getElementById("icon").classList.contains("fa-eye-slash")){
        document.getElementById("password").setAttribute("type","text")
        document.getElementById("icon").classList.add("fa-eye")
        document.getElementById("icon").classList.remove("fa-eye-slash")
      }
      else{
        document.getElementById("password").setAttribute("type","password")
        document.getElementById("icon").classList.add("fa-eye-slash")
        document.getElementById("icon").classList.remove("fa-eye")
      }
     });
  }

  invalidUserName()
  {
    return (this.submitted && this.LoginForm.controls.phone.errors != null);
  }

  invalidPassword()
  {
    return (this.submitted && this.LoginForm.controls.password.errors != null);
  }

  PasswordkeyPress(event: any) {
    //to hide incorrect error message error
    this.param="";
    if (event.charCode==32) {
      event.preventDefault();
    }
  }

  UsernamekeyPress(event: any) {
    //to hide incorrect error message error
    this.param="";
    this.ResetPass="";
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if ((event.key != 8 && !pattern.test(inputChar))||event.charCode==32) {
      event.preventDefault();
    }
  }

  onSubmit(){
    this.submitted=true;
    if(this.LoginForm.invalid == true)
    {

      return;
    }
    else
    {
      this.loginService.LoginUser(this.LoginForm.value).subscribe((res)=>{
        console.log(res)
        var user = new User();
        user.name=res['name'];
        user.number=res['phone'];
        user.pic=res['pic'];
        user.about=res['about'];
        this.dataLayer.user=user;
        this.authService.doLoginUser(user)
        this.dataLayer.socket.on('connect',  ()=>{
        this.dataLayer.socket.emit('storeClientInfo', { number:this.dataLayer.user.number,socketId:this.dataLayer.socket.id });
        });
        this.router.navigate(['/home'])
        },
        err => {
        console.log(err)
        if( err.error.msg=="Incorrect Password"){
          this.param="incorrectPassword";
        }
        else if( err.error.msg=="User not exist"){
          this.param="invalidUsername";
        }
        },
      );
    }
  }
}
