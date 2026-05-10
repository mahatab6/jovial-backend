const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
    console.log("Testing Gemini API with model: gemini-1.5-flash");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello in JSON format with key 'message'");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("Gemini 1.5 Flash Failed:", error.message);
        
        console.log("\nRetrying with gemini-pro...");
        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Say hello in JSON format with key 'message'");
            console.log("Gemini Pro Success:", resultPro.response.text());
        } catch (errorPro) {
            console.error("Gemini Pro also failed:", errorPro.message);
        }
    }
}

testGemini();
