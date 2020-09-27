import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displaynumber'
})
export class DisplaynumberPipe implements PipeTransform {

  transform(elem: any, contactList): any {
    return elem.isGroup ? contactList.find(contact => contact.number === elem.msg.sender)?contactList.find(contact => contact.number === elem.msg.sender).number + ": ":""  : "";
  }

}
