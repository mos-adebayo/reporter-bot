import { log, writeToCsv, postRequest } from "../../utils";
import {postChatMessage} from "../slack";
import request from 'request';

export default async (options) => {
    try{
        console.log(options);
        request.get({
            url: "https://passerelle.test.vggdev.com/api/airport/search",
            // body: [],
            json: true,
        }, (err, response, body) => {
            if(err){
                message.text = `Well this is embarrassing :sweat: I couldn't successfully get the report`;
            }else if(response.statusCode !== 200){
                message.text = `Well this is embarrassing :sweat: I couldn't successfully get the report`;
            }else{
                message.text = `There are currently *${body.Count} airports* on1 Avitech`;

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