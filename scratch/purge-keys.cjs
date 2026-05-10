const Redis = require("ioredis");

const redis = new Redis({
    host: "star-amoeba-119291.upstash.io",
    port: 6379,
    password: "gQAAAAAAAdH7AAIgcDFkOTU1NmZlZmY0MmQ0NzdkYjhmMTE2MTEzYjZmMGRkMw",
});

async function clearKeys() {
    console.log("🚀 Purging BullMQ keys from Redis...");
    try {
        const keys = await redis.keys("bull:ai-generation:*");
        if (keys.length > 0) {
            console.log(`Found ${keys.length} keys. Deleting...`);
            await redis.del(...keys);
            console.log("✅ Keys deleted.");
        } else {
            console.log("No keys found.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        redis.disconnect();
        process.exit(0);
    }
}

clearKeys();
