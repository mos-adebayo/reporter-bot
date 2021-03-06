import fs from 'fs';
import path from 'path';
import config from 'config';
import csvWriter from 'csv-write-stream';
import morgan from 'morgan';
import mkdirp from 'mkdirp';
import tracer from 'tracer';
import request from 'request';

export const log = (() => {
    const logger = tracer.colorConsole();
    logger.requestLogger = morgan('dev');
    return logger;
})();

export const normalizePort = (val) => {
    const port = parseInt(val, 10);
    if(Number.isNaN(port)) return val;
    if(port >= 0) return port;
    return false;
};

export const delay = time => new Promise((resolve => {
    setTimeout(() => { resolve(); }, time);
}));

export const fileExists = async (filePath) => {
    let exists = true;
    try{
        fs.accessSync(filePath);
    }catch (err){
        if(err.code === 'ENOENT'){
            exists = false;
        }else{
            throw err;
        }
    }
    return exists;
};

export const writeToCsv = ({ headers, records, filepath }) => {
    const writer = csvWriter({ headers });
    writer.pipe(fs.createWriteStream(filepath));
    records.forEach(r => writer.write(r));
    writer.end();
};

export  const getReportFilesDir = () => {
  let reportFilesDir;
  try{
      reportFilesDir = path.join(__dirname, `../${config.get('reportFilesDir')}`);
      mkdirp.sync(reportFilesDir);
      return reportFilesDir;
  }catch (err){
      throw  err;
  }
};

export  const numberWithCommas = x => {
  x = x.toFixed(2);
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};
export  const formatMoney = x => {
  x = x.toFixed(2);
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return '_NGN_ ' + parts.join(".");
};


/*API Request*/
export const postRequest = (url, payload) => {
   return new Promise((resolve, reject) => {
        request.post({
            url: url,
            body: payload,
            json: true,
        }, (err, response, body) => {
            if(err){
                reject(err);
            }else if(response.statusCode !== 200){
                reject(body);
            }else if(body.ok !== true){
                const bodyString = JSON.stringify(body);
                reject(new Error(`Got non ok response while posting chat message. Body-> ${bodyString}`));
            }else{
                resolve(body);
            }
        });
    })
};

export const getWeekDayName = (code) => {
    let weekName = '';
    switch (code){
      case 1:
          weekName = 'Monday'; break;
      case 2:
          weekName = 'Tuesday'; break;
      case 3:
          weekName = 'Wednesday'; break;
      case 4:
          weekName = 'Thursday'; break;
      case 5:
          weekName = 'Friday'; break;
      case 6:
          weekName = 'Saturday'; break;
      case 0:
          weekName = 'Sunday'; break;
      default:
          weekName = 'Anonymous';
    }
    return weekName;
};
