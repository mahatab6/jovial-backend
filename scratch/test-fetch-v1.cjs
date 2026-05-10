const dotenv = require("dotenv");
dotenv.config();

async function testFetchV1() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    console.log("Testing with manual fetch to V1:", url.replace(key, "REDACTED"));
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Say hi" }] }]
            })
        });
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

testFetchV1();
