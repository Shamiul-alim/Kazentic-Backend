import { Injectable } from "@nestjs/common";


@Injectable()export class EmailService {
  constructor(
 
  ) {}

async getEmails(){
try {
    return "Emails";
    
} catch (error) {
    
    throw error;
}
}

}