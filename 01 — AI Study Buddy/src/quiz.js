

import { generateContent } from './geminiClient.js';
import { buildQuizPrompt } from './promptBuilder.js';

export async function generateQuiz(topic) {

    try{

        const response = await generateContent({
            prompt: buildQuizPrompt(topic),
            config : {
                temperature: 0.2,
                maxTokens: 450  // Caps output — enough for 3 questions, prevents 15-question overload
            }
        });

        // console.log('response' , response);
        

        //* Bulletproof JSON Extraction
        // 1. Find where the actual "questions" array starts (bypasses empty bracket stutters)
        const targetIndex = response.indexOf('"questions"');
        
        if (targetIndex === -1) {
            console.error("\n[DEBUG] AI failed to output questions. Raw response:\n", response);
            throw new Error("AI response did not contain the 'questions' array.");
        }

        // 2. Search backwards from the target to find the true opening bracket
        const start = response.lastIndexOf('{', targetIndex);
        const end = response.lastIndexOf('}');
        
        if (start === -1 || end === -1) {
            throw new Error("AI response did not contain valid JSON brackets.");
        }

        const jsonString = response.substring(start, end + 1); 
        
        // 3. Safe Parsing with Debugging
        let data;

        try {

            data = JSON.parse(jsonString); 

        } catch (parseError) {
            console.error("\n[DEBUG] The AI generated invalid JSON. Here is the broken string:\n", jsonString);
            throw new Error(`JSON Parsing crashed: ${parseError.message}`);
        }
        
        console.log('✅ Quiz Generated! Here are your questions:');
        // console.log(JSON.stringify(data, null, 2)); //! print the string in proper format.

        return data;



    }catch(error) {
        throw new Error(`Failed to generate quiz: ${error.message}`);
    }
};


export async function runQuizFlow(topic , rl) {

    console.log(`🧠 Generating a ${topic} Quiz for you...`);
    const quiz = await generateQuiz(topic);
    const questions = quiz.questions; // extract only question from the quiz object


    for( let i = 0; i < questions.length; i++) {
        const q = questions[i];

        // Display the question cleanly (no leading whitespace)
        console.log(`\n--- Question ${i + 1} of ${questions.length} ---`);
        console.log(q.question);
        console.log(`A. ${q.options.A}`);
        console.log(`B. ${q.options.B}`);
        console.log(`C. ${q.options.C}`);
        console.log(`D. ${q.options.D}`);

        const answer = await rl.question('\nYour answer (A-D): ');

        if(answer.toUpperCase() === q.answer.toUpperCase()) {
            console.log('\n✅ Correct!\n');
        } else {
            console.log(`\n❌ Wrong! The correct answer was ${q.answer}. ${q.options[q.answer]}\n`);
        }

    }  
    
    console.log('\n🎉 Quiz finished! Well done.\n');
    
};