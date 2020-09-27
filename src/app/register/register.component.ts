import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from '../custom-validators';
import { LoginService } from '../services/login.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  userForm: FormGroup;
  registered = false;
  submitted = false;
  userExistError ="";
  Otp_invalid="";
  otpForm:FormGroup;
  data:object;
  param: string="register";

  constructor(private formBuilder: FormBuilder,private loginService:LoginService,private authService:AuthenticationService,private router:Router) { }

  invalidUserName(){
    return (this.submitted && this.userForm.controls.name.errors != null);
  }
  invalidPhone()
  {
  return (this.submitted && this.userForm.controls.phone.errors != null);
  }
  invalidPassword()
  {
  	return (this.submitted && this.userForm.controls.password.errors != null);
  }
  invalidOTP()
  {
  	return (this.submitted && this.otpForm.controls.otpCode.errors != null );
  }

  PasswordkeyPress(event: any) {
    //to hide incorrect error message error
    if (event.charCode==32) {
      event.preventDefault();
    }
  }

  PhonekeyPress(event: any) {
    if (event.charCode==32) {
      event.preventDefault();
    }
    const pattern = /[0-9]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  otpkeyPress(event: any) {
    const pattern = /[0-9 ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if ((event.key != 8 && !pattern.test(inputChar))||event.charCode==32) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    const pattern = /^[0-9]*$/;
    let pastedText = clipboardData.getData('text');
    console.log(pastedText)
    if (!pattern.test(pastedText)) {
      event.preventDefault();
    }
  }
  ngOnInit() {
    this.otpForm=  this.formBuilder.group({
      otpCode:["", [Validators.required]]
      })
  	this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone:['', Validators.compose([Validators.required,Validators.pattern("[0-9]{10}")])],
      password: ['', Validators.compose([Validators.required,Validators.minLength(8),
        CustomValidators.patternValidator(/\d/, { hasNumber: true }),
        CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
      ])],
      confirmPassword: ['', Validators.compose([Validators.required])]
        
    },
    {
      // check whether our password and confirm password match
      validator: [CustomValidators.passwordMatchValidator]
   })

 setTimeout(() => {
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
  }
  );
 }, 60);

  }

  onSubmit()  
  {
    this.submitted = true;
  	if(this.userForm.invalid == true)
  	{
  		return;
  	}
  	else
  	{
      this.loginService.checkUser(this.userForm.value.phone).subscribe((res)=>{
       console.log(res);
        this.data=res;
        if(this.data['msg']=="Username Available"){
          this.param="Otp"
         this.submitted = false;

          this.userExistError="";
          this.registered = true;

          this.onOTPSubmit()
           this.router.navigate(['/register'],{ queryParams: { verifyphone: this.userForm.value.phone} })
          this.loginService.SendOTPtoPhone(this.userForm.value.phone)
          .subscribe((res)=>{
            if(res['message']=='OTP Sent successfully.'){
              localStorage.setItem("OTP_SessionId",res['SessionId']);
          
            }
           },
           err => {console.log( err)},
           );
        }
        else{
          this.userExistError="aaa";
          return;
        }
      })
    }
  }
  onOTPSubmit(){
    this.submitted = true;
    
  	if(this.otpForm.invalid == true)
  	{
  		return;
  	}
  	else
  	{
    this.submitted = false;
    this.loginService.VerifyOTP(this.otpForm.value.otpCode,localStorage.getItem("OTP_SessionId")).subscribe((res)=>{
      console.log(res)
      if(res['message']=='OTP Verified successfully.'){
    this.loginService.postUser(this.userForm.value).subscribe((res)=>{
    console.log(res['msg'])
    if(res['msg']=="User sucessfully created"){
    this.router.navigate(['/login'])
   }
       }
          );
      }
      else{
      this.Otp_invalid="aaaa";
      }
    }
    )
  	}
  }
}
