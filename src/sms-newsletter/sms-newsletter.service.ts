import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsNewsletterService {
//  async sendsms(mobilenumber:String,name:string,message:string):Promise<any> {

//   const url = `https://control.msg91.com/api/v5/flow`;
//   console.log(url,"url");
  
//   const headers = {     
//     accept: 'application/json',
//     'content-type': 'application/json',
//     authkey: '403400AyN459sBBG652cdb9bP1'
//   };

  
// const data = {
// template_id: '67fe1840d6fc056cb3784da3',
// short_url: '1 (On) or 0 (Off)',
// recipients: [{mobiles: mobilenumber , var: name, var1: message}]
// }

// try {

// const response = await axios.post(url, data, { headers});
// console.log(response,response);


// return response.data;
// }catch (error) {
//   throw error;
// }

// }




async sendsms(mobilenumber:String,message:string):Promise<any> {

  const url = `https://control.msg91.com/api/v5/flow`;
  console.log(url,"url");
  
  const headers = {     
    accept: 'application/json',
    'content-type': 'application/json',
    authkey: '403400AyN459sBBG652cdb9bP1'
  };

  
const data = {
template_id: '67fe1840d6fc056cb3784da3',
short_url: '1 (On) or 0 (Off)',
recipients: [{mobiles: mobilenumber , var: message}]
}

try {

const response = await axios.post(url, data, { headers});
console.log(response,response);


return response.data;
}catch (error) {
  throw error;
}

}
}
