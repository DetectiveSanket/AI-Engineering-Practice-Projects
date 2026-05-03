

const sessionStore = {
    scores: [],         // ← array of { topic, score, timestamp }
    totalScore: 0,      // ← sum of all scores (for easy average calculation)
    count: 0            // ← number of scored entries
}

export function addScore(topic , score) {
    sessionStore.scores.push({
        topic,
        score,
        timestamp: Date.now(),
    })

    sessionStore.totalScore += score
    sessionStore.count += 1
}

export function getRunningAverage() {
    // if (sessionStore.count === 0) return 0
    // return (sessionStore.totalScore / sessionStore.count).toFixed(1);
    return sessionStore.count === 0 ? 0 : (sessionStore.totalScore / sessionStore.count).toFixed(1);
}

export function displayScores() {
    if(sessionStore.scores.length === 0) {
        console.log("No scores recorded yet.");
        return;
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎯 Study sessionStore Scores");
    console.log("=".repeat(50));

    sessionStore.scores.forEach((item , index) => {
        console.log(`# ${index + 1}. ${item.topic}: `);
        
        const bar = "█".repeat(item.score);
        console.log(`   Score: ${item.score} / 5 ${bar}`);
    })

    console.log("=".repeat(50));
    console.log(`Average Score: ${getRunningAverage()}`);
    console.log("=".repeat(50)); 
}

export function clearScores() {
    sessionStore.scores = [];
    sessionStore.totalScore = 0;
    sessionStore.count = 0;
}