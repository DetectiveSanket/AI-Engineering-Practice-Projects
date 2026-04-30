

import fs from 'node:fs';
import path from 'node:path';
// import path from 'path';
import { fileURLToPath } from 'node:url';

const __direname = path.dirname(fileURLToPath(import.meta.url));

// log store

const logger = {
    startTIme : Date.now(),
    endTime : null,
    topics : [],
    responses : []
};

export function logResponse (topic , strategy , prompt , response) {
    logger.responses.push({
        topic : topic,
        strategy : strategy,
        prompt : prompt,
        response : response
    });

    logger.topics.push(topic);


}

export function saveSession() {

    logger.endTime = Date.now();

    const logsDire = path.join(
        __direname ,
        '..',
        'logs'        
    );

    // create log files
    if (!fs.existsSync(logsDire)) {
        fs.mkdirSync(logsDire , {
            recursive : true
        });
    }

    // create log file name with timestamp
    const filename = `session-${Date.now()}.json`;

    const filepath = path.join(logsDire , filename);

    // write json
    fs.writeFileSync(filepath , JSON.stringify(logger , null , 2)); // 2 is indentation level (pretty-printing)

    console.log(`📝 Session logged to: ${filepath}`);
    
}