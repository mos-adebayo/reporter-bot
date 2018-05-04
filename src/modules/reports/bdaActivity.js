import { log, writeToCsv, postRequest } from "../../utils";
import {postChatMessage} from "../slack";
import request from 'request';
import moment from 'moment';

export default async (options, slackReqObj) => {
    try{
        const active_date = "2017-11-30";
        const date_string =  moment(active_date).format("Do of MMM., YYYY"); //new Date(active_date);
         const message = {
            responseUrl: slackReqObj.response_url,
            replaceOriginal: false,
            mrkdwn: true,
            mrkdwn_in: ['text'],
        };
          request.post({
             url: `http://bdaservice.test.vggdev.com/api/open/GetRemitaFailureReport?fromDate=${active_date}&toDate=${active_date}`,
            json: true,
        }, (err, response, body) => {
             // console.log('End fof API');
             // console.log(err);
             // console.log('Body', body);
             // console.log('Response', response.body);
             // console.log('Response', response.statusCode);
             // console.log(body);
             if(err){
                message.text = `Well this is embarrassing :sweat: I couldn't successfully get the report for *BDA*`;
            }else if(response.statusCode === 201 || response.statusCode === 200){
                 if(response.body.length === 0){
                     message.text = `You have no issues today. Go get some drink. :champagne:`
                 }else{
                     let Amount = 0; let TotalRemitaAmount = 0; let BDAProcessedAmount = 0;
                     response.body.forEach(function (item) {
                         Amount += item.Amount;
                         TotalRemitaAmount += item.TotalRemitaAmount;
                         BDAProcessedAmount += item.BDAProcessedAmount;
                     });
                     message.text = `You have a total of *${body.length} invoices* with issues on _${date_string}_ . *${Amount}* was uploaded, *${BDAProcessedAmount}* was processed by BDA and *${TotalRemitaAmount}* was processed by Remita`;
                 }
            }else{
                 message.text = `Well this is embarrassing :sweat: I couldn't successfully get report for *BDA*`;
             }
            return postChatMessage(message)
                .catch((ex) => {
                    log.error(ex);
                });
        });

    }catch (err){
        throw err;
    }
}