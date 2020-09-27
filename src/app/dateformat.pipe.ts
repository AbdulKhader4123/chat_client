import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateformat'
})
export class DateformatPipe implements PipeTransform {

  transform(dateString: any,type:any,otherDateString:any): any {
    let date :any = dateString ? new Date(dateString) : new Date();

    let newDate :any =new Date();
    let dualize = (x) => x < 10 ? "0" + x : x;
    // let getTime = () => dualize(date.getHours()) + ":" + dualize(date.getMinutes());
    let getTime = () => newDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    let getDate = () => dualize(date.getDate()) + "/" + dualize(date.getMonth()+1) + "/" + dualize(date.getFullYear());
    if(type=="subtract")
    {
      otherDateString= new Date(otherDateString);
      return (date  - otherDateString);
    }
    else if(type=="lastSeenFormat")
    {
      let dateDiff = Math.round(newDate - date) / (1000 * 60 * 60 * 24);
      let value = (dateDiff === 0) ? "today" : (dateDiff === 1) ? "yesterday" : getDate();
      return value + " at " + getTime();
    }
    else if(type=="chatListFormat")
    {
      let dateDiff = Math.round((newDate - date) / (1000 * 60 * 60 * 24));

      if (dateDiff === 0) {
          return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      } else if (dateDiff === 1) {
          return "Yesterday";
      } else {
          return getDate();
      }
    }
    else if(type=="getDate")
    {
      return getDate();
    }
    else if(type=="getTime")
    {
      return getTime();
    }
    else if(type=="toString")
    {
      return date.toString().substr(4, 20);
    }
    else if(type=="toString1")
    {
      return date.toString().substr(16,8);
    }
    };

}
