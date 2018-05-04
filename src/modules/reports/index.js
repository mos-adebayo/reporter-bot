import path from 'path';
import config from 'config';
import request from 'request';

import { log, delay, fileExists, getReportFilesDir} from '../../utils';
import { postChatMessage, uploadFile, getAirline } from '../slack';

//reports
import getUserActivity from './getUserActivity';
import getAirlinesActivity from './airlinesActivity';
import getAirportsActivity from './airportsActivity';
import { bdaActivities } from './bdaActivity';

const slackconfig = config.get('slack');

const REPORTS_CONFIG = {
   /* userActivity: {
        name: 'User Activity',
        namePrefix: 'userActivity',
        type: 'csv',
        func: getUserActivity,
    },*/
    airports: {
        name: 'Airports',
        namePrefix: 'airports',
        type: 'text',
        func: getAirportsActivity,
    },
    airlines: {
        name: 'Airlines',
        namePrefix: 'airlines',
        type: 'csv',
        func: getAirlinesActivity,
    },
    bda: {
        name: 'BDA',
        namePrefix: 'bda',
        type: 'csv',
        func: bdaActivities.showDateList,
    }
};

export const reportsList = Object.entries(REPORTS_CONFIG)
.map(([key, value]) => {
    const report = {
        text: value.name,
        value: key,
    };
    return report;
});

const generateReportImplAsync = async(options,  slackReqObj) => {
  const {
      reportName,
      reportTmpName,
      reportType,
      reportFilePath,
      reportFunc
  }  = options;

  try{
      /*
      * Call on the Option for appropriate action
      * */
      await reportFunc(options, slackReqObj);
  } catch (err) {
      console.log(err);
        const message = {
          responseUrl: slackReqObj.response_url,
          replaceOriginal: false,
          text: `Well this is embarrassing :sweat: I couldn't successfully get the report *${reportName}*. Please try again later as I look into what went wrong.`,
          mrkdwn: true,
          mrkdwn_in: ['text'],
      };
      return postChatMessage(message)
          .catch((ex) => {
              log.error(ex);
          });
  }
};

export const generateReport = async(options) => {
  try{
      const { slackReqObj } = options;

      // console.log("Options", options);

      const  reportKey = slackReqObj.actions[0].selected_options[0].value;
      const report = REPORTS_CONFIG[reportKey];

      if(report === undefined){
          const slackReqObjString = JSON.stringify(slackReqObj);
          log.error(new Error(`reportKey: ${reportKey} did not match any report`));

          const response = {
              response_type: 'in_channel',
              text: 'Hmmm :thinking_face: seems like that report is not available'
          };
          return response;
      }

      const reportTmpName = `${report.namePrefix}_${Date.now()}.${report.type}`;
      const reportFilesDir = getReportFilesDir();
      const reportFilePath = path.join(reportFilesDir, reportTmpName);

      const reportParams = {
          reportName: report.name,
          reportTmpName,
          reportType: report.type,
          reportFilePath,
          reportFunc(){
            return report.func( reportFilePath, slackReqObj);
          }
      };

     generateReportImplAsync(reportParams, slackReqObj );

    let response = {
      response_type: 'in_channel',
      text: `Got it :thumbsup: . I'm currently processing your request on *${report.name}*\n Please carry on, I'll notify you when I'm done`,
      mrkdwn: true,
      mrkdwn_in: ['text'],
    };
     if(reportParams.reportName === 'BDA'){
      response.text = 'Please select your preferred date';
     }
    return response;

  }catch (err){
      throw err;
  }
};

