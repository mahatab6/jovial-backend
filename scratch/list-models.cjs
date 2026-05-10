const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    console.log("Listing available Gemini models...");
    try {
        // The SDK doesn't have a direct listModels, we need to use fetch or a different approach
        // But we can try to hit a known model like gemini-1.5-flash-8b
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
        
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("test");
                console.log(`✅ Success with: ${m}`);
                return;
            } catch (e) {
                console.log(`❌ Failed with: ${m} - ${e.message.substring(0, 50)}...`);
            }
        }
    } catch (error) {
        console.error("General Error:", error.message);
    }
}

listModels();
