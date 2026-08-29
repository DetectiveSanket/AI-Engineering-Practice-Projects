
import fs from 'fs';
import path from 'path';
import * as memory from './memory.js';


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

    const sourceFormate = scratchpad.getSources().map(s => {
        return {
            title:s.title,
            url:s.url
        }
    })

    const report = {
        question:question,
        answer: answer,
        source:sourceFormate,
        stepUsed:scratchpad.step,
        toolUsed:scratchpad.toolsUsed,
        generatedAt: new Date().toISOString(),
    }
    return report;
}

// Save report
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // src/

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