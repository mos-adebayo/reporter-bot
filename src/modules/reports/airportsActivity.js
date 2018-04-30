import { log, writeToCsv, postRequest } from "../../utils";
import {postChatMessage} from "../slack";
import request from 'request';

export default async ( options, slackReqObj) => {
    try{
        // console.log('slack', options);
        // const { slackReqObj } = options;
        // console.log('options', options);
        const message = {
            responseUrl: slackReqObj.response_url,
            replaceOriginal: false,
            mrkdwn: true,
            mrkdwn_in: ['text'],
        };
         request.get({
            url: "https://passerelle.test.vggdev.com/api/airport/search",
            json: true,
        }, (err, response, body) => {
            if(err){
                message.text = `Well this is embarrassing :sweat: I couldn't successfully get the report`;
            }else if(response.statusCode !== 200){
                message.text = `Well this is embarrassing :sweat: I couldn't successfully get the report`;
            }else{
                let local = []; let international = [];
                body.Results.forEach(function (item) {
                    if(item.IsLocal){
                        local.push(item);
                    }else{
                        international.push(item);
                    }
                });
                message.text = `There are currently *${body.Count} airports* on Avitech. This consists of *${local.length}* local & *${international.length}* international airports.`;
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