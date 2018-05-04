import request from 'request';
import moment from 'moment';
import { log, getWeekDayName } from '../../utils';
import { postChatMessage } from '../slack';

const getBdaActivity = async(options) => {

// } getBdaActivity async (options, slackReqObj) => {
  try {
    const { slackReqObj } = options;
    const  activeDate = '2017-11-30'; //slackReqObj.actions[0].selected_options[0].value;
    const dateString = moment(activeDate).format('Do of MMM., YYYY');
    const message = {
      responseUrl: slackReqObj.response_url,
      icon_emoji: ':ghost:',
      replaceOriginal: false,
      mrkdwn: true,
      mrkdwn_in: ['text'],
      attachments: [
        {
          color: '#a61847',
          footer: 'Avitech',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
          ts: new Date().getTime(),
        }
      ],
    };
    request.post({
      url: `http://bdaservice.test.vggdev.com/api/open/GetRemitaFailureReport?fromDate=${activeDate}&toDate=${activeDate}`,
      json: true,
    }, (err, response, body) => {
      if (err) {
        message.attachments[0].text = 'Well this is embarrassing :sweat: I couldn\'t successfully get the report for *BDA*';
      } else if (response.statusCode === 201 || response.statusCode === 200) {
        if (response.body.length === 0) {
           message.attachments[0].text = `There are no issues on the *_${dateString}_*. Go get some drink. :champagne:`;
        } else {
          let Amount = 0; let TotalRemitaAmount = 0; let BDAProcessedAmount = 0;
          response.body.forEach((item) => {
            Amount += item.Amount;
            TotalRemitaAmount += item.TotalRemitaAmount;
            BDAProcessedAmount += item.BDAProcessedAmount;
          });
          message.text = `You have a total of *${body.length} invoices* with issues on the _${dateString}_ . See below details I can get on payments`;
          message.attachments[0].fallback = `You have a total of *${body.length} invoices* with issues on _${dateString}_ . See below details I can get on payments`;
          message.attachments[0].text = `*Amount* \n ${Amount}  \n *BDA* \n ${BDAProcessedAmount} \n *Remita* \n ${TotalRemitaAmount}`;
        }
      } else {
        message.attachments[0].text = 'Well this is embarrassing :sweat: I couldn\'t successfully get report for *BDA*';
      }
      return postChatMessage(message)
        .catch((ex) => {
          log.error(ex);
        });
    });

    const response = {
      response_type: 'in_channel',
      text: `Got it :thumbsup: . I'm currently processing your request on. I'll notify you when I'm done`,
      mrkdwn: true,
      mrkdwn_in: ['text'],
    };
    return response;

  } catch (err) {
    throw err;
  }
};

function showDateList(options, slackReqObj) {
  try {
    let datesList = [];
    for (let i = 2; i < 7; i++){
      datesList.push({
        text: `Last ${getWeekDayName(moment().subtract(i, 'days').weekday())}`,
        value: moment().subtract(i, 'days').format('YYYY-MM-DD').toString(),
        func: getBdaActivity
      })
    }
    const message = {
      responseUrl: slackReqObj.response_url,
      icon_emoji: ':ghost:',
      replaceOriginal: false,
      mrkdwn: true,
      mrkdwn_in: ['text'],
      attachments: [
        {
          text: 'Choose Date',
          color: '#3AA3E3',
          attachment_type: 'default',
          callback_id: 'bda_date',
          actions: [
            {
              name: 'date_list',
              text: 'Pick a date',
              type: 'select',
              options: [
                {
                  text: 'Today',
                  value: moment().format('YYYY-MM-DD').toString(),
                  func: getBdaActivity
                },
                {
                  text: 'Yesterday',
                  value: moment().subtract(1, 'days').format('YYYY-MM-DD').toString(),
                  func: getBdaActivity
                },
                ...datesList,
              ],
            },
          ],
        },
      ],
    };
    return postChatMessage(message)
      .catch((ex) => {
        log.error(ex);
      });
  } catch (err) {
    throw err;
  }
}

export const bdaActivities = {
  showDateList,
  getBdaActivity
};
