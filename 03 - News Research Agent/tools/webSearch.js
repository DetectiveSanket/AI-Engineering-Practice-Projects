// import axios from "axios";

import NewsAPI from "newsapi"; 

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Force dotenv to load from the exact folder this file is in
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });


//! Direct using  npm install newsapi --save packages 

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

export async function webSearch(query) {

    console.log('------- webSearch tool is called ------');
    console.log("Query :- " , query);
    
    try {
        
        const respose = await newsapi.v2.everything({
        // const respose = await newsapi.v2.topHeadlines({
            q: query,
            language: 'en',
            // category: 'technology',
            // country: 'in'
            // sortBy: 'relevancy',
            // page: 2
        })

        if(respose.status !== 'ok' || !respose.articles) {
            return 'No articles found for this query.'
        }

        // console.log('respose' , respose);
        

        const articles = respose.articles;

        // ─── DEBUG: what did NewsAPI actually return? ───────────────────
        console.log(`\n📰 NewsAPI raw response: ${articles.length} total articles found`);
        console.log('📋 All article titles + dates:');
        articles.forEach((a, i) => {
            console.log(`  [${i+1}] "${a.title}" — ${a.publishedAt?.slice(0,10)}`);
        });
        // ────────────────────────────────────────────────────────────────

        const top3 = articles.slice(0, 3).map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt
        }));

        console.log('\n✅ Returning top 3 to agent:');
        top3.forEach((a, i) => {
            console.log(`  [${i+1}] "${a.title}"`);
            console.log(`       ${a.description?.slice(0,100)}...`);
        });

        return top3;
        
    } catch (error) {
    console.log(`webSearch error: ${error.message}`);
    return [
        {
            title: "Search unavailable",
            description: "Could not retrieve live results. Please try again.",
            url: "",
            publishedAt: new Date().toISOString()
        }
    ];
}

};

// webSearch('AI Agent by Anthropic');

/* 
    !## Manually

    export async function webSearch(query) {
    
        const API_KEY = process.env.NEWS_API_KEY;
    
        if (!API_KEY) {
            return 'NewsAPI key is missing from .env file.';
        }
    
        // const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`;
        const url = "https://newsapi.org/v2/everything?q=bitcoin&apiKey=3ce7f6faba194dbaab698303674a3ec1"
    
        try {
    
            const response = await axios.get(url, {
                timeout: 5000
            });
    
            if (response.data.status !== 'ok') {
                return `API error: ${response.data.message}`;
            }
    
            const articles = response.data.articles;
    
            if (!articles || articles.length === 0) {
                console.log('No articles found for this query.');
            }
    
            console.log('articles' , articles);
            
    
            Return top 3 results
            return articles.slice(0, 3).map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt
            }));
    
            console.log(`🚀 successfully retrieved news`);    
    
        } catch (error) {
            console.log(`Error` );
            
        }

    };
    
    webSearch('Who win ipl 2025');
*/
