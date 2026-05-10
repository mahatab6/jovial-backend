const dotenv = require("dotenv");
dotenv.config();

async function listModelsFetch() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    console.log("Listing models via fetch...");
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.models) {
            console.log("Available models:", data.models.map(m => m.name).join(", "));
        } else {
            console.log("No models returned:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

listModelsFetch();
