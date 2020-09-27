
export class Message{
    public sender :string;
    public body:string;
    public time:string;
    public status :string;// message status - 0:sent, 1:delivered, 2:read
    public recvId:string;
    public IsGroup:boolean;
  
    constructor(Response:any){
        this.sender=Response.sender;
        this.body=Response.body;
        this.time=Response.time;
        this.status=Response.status;
        this.recvId=Response.recvId;
        this.IsGroup=Response.IsGroup;
    }
}