

/* 
    ## Day 9 — Session memory (S6, memory.js)

    > Goal: The CLI remembers what topics you've asked about in this session.

        Tasks:
        - [] Write memory.js — simple JS object, not Redis, not a DB
        - [] Structure: { topics: [], lastTopic: null, questionCount: 0 }
        - [] Functions: addTopic(topic), getHistory(), clearSession()
        - [] Update index.js: on each input, save to memory
        - [] Add "history" command to CLI: shows all topics asked this session
        - [] If user types a topic they already asked: show "You asked this before. Want a different angle? (y/n)"

*/

//! Hint: JavaScript arrays have an .includes() method that checks if a value already exists.

const session = {
    topic: [],
    lastTopic: null,
    questionCount: 0
};



//* Add the topic to the session
export function addTopic(topic) {
    // first check topic is in the list if yes dont add topic else push the new topic
    session.topic.push({ 
        topic: topic,
        timestamp: Date.now()
    })
    session.lastTopic = topic;
    session.questionCount += 1;
};

//* function that give all the perviou questino you asked 
export function getHistory(){

    // VERSION A (your uncommented — what you kept):
    return session.topic;
        // Returns: [ { topic: "Java", timestamp: 173... }, { topic: "Python", timestamp: 174... } ]
        // This is an ARRAY OF OBJECTS.

    // VERSION B (your commented out):
    // return session.topic.map(t => t.topic);
        // Returns: [ "Java", "Python" ]
        // This is a plain ARRAY OF STRINGS.

};

export function clearSession() {
    // clear the session
    session.topic = [];
    session.lastTopic = null;
    session.questionCount = 0;
};

//* function that checks if a topic already exists in the session.
export function hasTopic(topic) {
    return session.topic.some(t => t.topic.toLowerCase() === topic.toLowerCase());

    //! .some() loops through the array and returns true if any item matches.
    // This returns true or false — nothing else.
    // Then in index.js you just write: if (hasTopic(userInput)) { ... }
};