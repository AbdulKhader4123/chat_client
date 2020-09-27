
export class Group{
    public name :string;
    public members:Array<string>;
    public created:string;
    public createdBy :string;
    public admins:Array<string>;
    public groupId?:string;
    public pic?:string;

    constructor(Response:any){
        this.name=Response.name;
        this.members=Response.members;
        this.created=Response.created;
        this.createdBy=Response.createdBy;
        this.admins=Response.admins;
        this.groupId=Response.groupId;
        this.pic=Response.pic;
    }
}