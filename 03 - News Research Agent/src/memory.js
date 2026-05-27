

const scratchpad = {
    question: "",
    thoughts: [],
    observation: [],
    steps: 0
};

export function setQuestion(q) {
    clear();
    scratchpad.question = q;
}

export function addThought(thought)  {
    scratchpad.thoughts.push({
        thought,
        timestamp: Date.now()
    });
    scratchpad.steps++;
}


export function addObservation(tool, args, result) {
    scratchpad.observation.push({
        tool,
        args,
        result: result.slice(0,800),
        timestamp: Date.now()
    });  
}

export function getContext(maxObs = 14) {

    // Take last N observations (rounded up)
    const recentObs = scratchpad.observation.slice(-maxObs);
    const obsCount = recentObs.length;
    
    // each obs ~ 500 tokens. Max ~2500 tokens.
    const obsText = recentObs.map(o => 
        `[${o.tool} ${o.args}] => ${o.result}`
    ).join('\n');

    // thoughts - always include last 5 thoughts
    const recentThoughts = scratchpad.thoughts.slice(-5).map(t =>
        t.thought
    );
    
    const thoughtsText = recentThoughts.length > 0 
        ? "\nRecent thoughts:\n" + recentThoughts.join('\n') 
        : "";

    const summary = {
        question: scratchpad.question,
        maxObs,
        obsCount,
        totalSteps: scratchpad.steps,
        text: 
            `Question: ${scratchpad.question}\n\n` +
            obsText +
            thoughtsText
    }

    // return summary;
    return summary.text;
}

export function getScratchpad() {
    return {
        question: scratchpad.question,
        thoughts: [...scratchpad.thoughts],
        memoryObservation: [...scratchpad.observation], 
        stepsUsed: scratchpad.steps                   
    };
}

export function getSources() {
    return scratchpad.observation.filter(o => o.tool === 'web_search').map(o => ({
        title: o.result?.title,
        url: o.result?.url
    }));
}

export function getToolsUsed() {
    return scratchpad.observation.map(o => o.tool);
}



export function clear() {
    scratchpad.question = "";
    scratchpad.thoughts = [];
    scratchpad.observation = [];
    scratchpad.steps = 0;
}