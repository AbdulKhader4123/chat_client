import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http'


@Injectable({ providedIn: 'root' })
export class LoginService{

        // readonly baseUrl='http://localhost:4000/api'
    constructor(private http:HttpClient){
    }
LoginUser(user:any){
    return this.http.post("api/user/loginUser",user)
}
postUser(user:any){
    
    return this.http.post("api/user/registerUser",user)
}
checkUser(phone:String){
    return this.http.post("api/user/checkUser",{phone:phone})
}
SendOTPtoPhone(phone:String){
    return this.http.post("api/user/GenerateOTP",{phoneNumber:phone})
}
VerifyOTP(Otp:String,sessionId:string){
    return this.http.post("api/user/VerifyGenerateOTP",{OTP:Otp,sessionID:sessionId})
}
}