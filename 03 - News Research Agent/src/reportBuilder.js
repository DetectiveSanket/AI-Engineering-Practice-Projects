
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // src/ — used by saveReport() to locate ../reports/


const answerFormate = {
    question: String,
    answer: String,
    source: [{
        title : String , url : String
    }],
    stepUsed: Number,
    toolUsed: [String],
    generatedAt: String
}

export function buildReport(question, answer, scratchpad) {

    // Sources — only web_search observations contain article data.
    // result is stored as a JSON *string* (JSON.stringify was called in agentLoop).
    // We parse it back to an array of articles and extract title + url from each.
    const sources = scratchpad.memoryObservation
        .filter(obs => obs.tool === 'web_search')
        .flatMap(obs => {
            try {
                const articles = JSON.parse(obs.result);
                return articles.map(a => ({ title: a.title, url: a.url }));
            } catch {
                return []; // skip if result can't be parsed
            }
        })
        .filter(s => s.title && s.url); // drop any entries missing both fields

    // toolsUsed — the property in each observation is 'tool', not 'toolName'
    const toolsUsed = scratchpad.memoryObservation.map(obs => obs.tool);

    const report = {
        question:    question,
        answer:      answer,
        sources:     sources,       // plural — matches buildReportText()
        stepsUsed:   scratchpad.stepsUsed,  // matches buildReportText()
        toolsUsed:   toolsUsed,     // plural — matches buildReportText()
        generatedAt: new Date().toISOString(),
    };
    return report;
}


export async function saveReport(report) {
    // Ensure reports/ directory exists
    const reportDir = path.join(__dirname, '../reports');
    await fs.promises.mkdir(reportDir, { recursive: true });

    // Generate filename: report-YYYYMMDD-HHMMSS.json
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filename = `report-${timestamp}.json`;
    const filePath = path.join(reportDir, filename);

    await fs.promises.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');

    return filePath;
}


// Display formatted report
export function buildReportText(report) {
    const sourceLines = report.sources.map(s =>
        `        • ${s.title}\n          ${s.url}`
    ).join('\n');

    return `
=========================================
        RESEARCH REPORT
=========================================

QUESTION: ${report.question}

ANSWER:
${report.answer}

SOURCES:
${sourceLines}

TOOLS USED: ${report.toolsUsed.join(', ')}
STEPS TAKEN: ${report.stepsUsed}
GENERATED: ${report.generatedAt}
=========================================
    `;  
}