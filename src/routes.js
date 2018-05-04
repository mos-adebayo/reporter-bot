import express from 'express';

import { log } from './utils';
import { reportsList, generateReport } from './modules/reports';
import { bdaActivities } from './modules/reports/bdaActivity';

const router = new express.Router();

router.post('/slack/command/report', async(req, res) => {
    try{
        const slackReqObj = req.body;
        const response = {
            response_type: 'in_channel',
            channel: slackReqObj.channel_id,
            text: 'Hello :face_with_monocle: , I am here to illuminate your darkness!',
            attachments: [
                {
                    text: 'What report would you like to get?',
                    fallback: 'What report would you like to get?',
                    color: '#2c963f',
                    attachment_type: 'default',
                    callback_id: 'report_selection',
                    actions: [{
                        name: 'reports_select_menu',
                        text: 'Choose a report...',
                        type: 'select',
                        options: reportsList
                    }]
                }
            ]
        };
        return res.json(response);

    }catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. Looking into it');
    }
});

router.post('/slack/actions', async(req, res) => {
    try{
        const slackReqObj = JSON.parse(req.body.payload);
        let response;
        if(slackReqObj.callback_id === 'report_selection'){
            response = await generateReport({ slackReqObj });
        }else if(slackReqObj.callback_id === 'bda_date'){
            response = await bdaActivities.getBdaActivity({ slackReqObj })
        }
        return res.json(response);
    }catch (err){
        log.error(err);
        return res.status(500).send('Something blew up');
    }
})

export default router;
