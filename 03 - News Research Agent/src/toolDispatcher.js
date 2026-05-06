

export function parseAction(text) {

    // 1. check the llm ouptut and extract the actoin (tool name) from the text/response to be used in the tool call 
    const actionMatch = text.match(/Action:\s*(\w+)\((.+)\)/); // -> this will look for "Action:" followed by whitespace, then capture the function name and arguments

    //2. check if the action is valid (present in the tools list)
    if(!actionMatch) {
        return {
            tool: null,
            error: "parse_failed"
        }
    };

    // 2.1 extract the tool name and argumnets form the actionMatch
    // const = actionMatch[0] // -> full matched string :- "Action: web_search(AI regulation 2025)"
    // const toolName = actionMatch[1]; // -> tool name :- "web_search"
    // const args = actionMatch[2]; // -> arguments :- "AI regulation 2025"

    const [, tool , args] = actionMatch;

    // 2.2 check the valid tool
    const validTools = ['web_search', 'summarize', 'check_claim'];
    
    if(!validTools.includes(tool)) {
        return {
            tool: null,
            error: "unknown_tool"
        }
    };


    //3. return an object in the format {tool: "web_search", args: "AI regulation 2025"}    
    return {
        tool,
        args: args.trim()
    };
};

export function isFinalAnswer(text) {
    return text.includes("Final Answer:")
};

export function extractFinalAnswer(text) {
    const match = text.match(/Final Answer:\s*(.*)/);

    // if match is found (not null) return the extracted final answer
    // if(match) {
    //     return match[1].trim()
    // }
    
    // if no final answer found return null
    // return null;

    // one more direct option
    return match ? match[1].trim() : null;
};