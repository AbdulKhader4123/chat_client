
export class Contact{
    public name :string;
    public phone:string;
    public pic:string;
    public lastSeen :string;
    public about :string;
  
    constructor(Response:any){
        this.name=Response.name;
        this.phone=Response.phone;
        this.pic=Response.pic;
        this.lastSeen=Response.lastSeen;
        this.about=Response.about;
    }
}