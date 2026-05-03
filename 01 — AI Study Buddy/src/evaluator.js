
import { generateContent } from './geminiClient.js';
import { buildEvalPrompt } from './promptBuilder.js';

export async function evaluateExplanation(topic, explanation) {

    try {
        const prompt = buildEvalPrompt(topic, explanation);

        const raw = await generateContent({
            prompt,
            config: { temperature: 0 }   // temperature 0 = deterministic scores
        });

        // --- Safe JSON extraction (same pattern as quiz.js) ---
        const start = raw.indexOf('{');
        const end   = raw.lastIndexOf('}');

        if (start === -1 || end === -1) {
            throw new Error("No JSON found in evaluator response");
        }

        const scores = JSON.parse(raw.slice(start, end + 1));

        const accuracy     = Number(scores.accuracy)     || 0;
        const clarity      = Number(scores.clarity)      || 0;
        const completeness = Number(scores.completeness) || 0;

        const average = parseFloat(((accuracy + clarity + completeness) / 3).toFixed(2));

        return { accuracy, clarity, completeness, average, reasoning: scores.reasoning ?? "" };

    } catch (error) {
        console.error("❌ Evaluator Error:", error.message);
        // Fallback: neutral score so the app does not crash
        return { accuracy: 3, clarity: 3, completeness: 3, average: 3, reasoning: "Evaluation failed." };
    }
};