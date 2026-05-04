

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

    // push the current time as endTIme into logger...
    logger.endTime = Date.now();

    // log directory ->  
    // __direname :  -> 01 — AI Study Buddy/src (it goes backward)
    // ..        -> 01 — AI Study Buddy
    // logs      -> logs (folder name)
    const logsDire = path.join(
        __direname ,
        '..', // it goes to the main directory
        'logs' // Folder Name where logs are saved (like) 
    );

    // create log files (root folder) if not exist
    if (!fs.existsSync(logsDire)) {
        fs.mkdirSync(logsDire , {
            recursive : true // if logs folder doesn't exist, create it with all parent folders 
        });
    }

    // create log file name with timestamp
    const filename = `session-${Date.now()}.json`;

    const filepath = path.join(logsDire , filename);// path -> creates paths to json files and join them together ( like this -> /logs/session-1234567890.json ) 

    // write json. Json.stringify -> to convert js object into json string.(for file writing). (so that the file can be read by other programs).
    fs.writeFileSync(filepath , JSON.stringify(logger , null , 2)); // 2 is indentation level (pretty-printing) or space between lines 
    // logger -> the object that contain the log info in object form
    // null -> we dont have any replacer function. Means dont use custom logic for replacing. (for file writing). 
    // 2 -> it is for indentation space , to make the json file readable

    console.log(`📝 Session logged to: ${filepath}`);
    
}