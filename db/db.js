const mongoose = require("mongoose");

const connectToMongo = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error("MONGO_URI is not defined. Make sure .env is loaded and contains MONGO_URI.");
        process.exit(1);
    }

    console.log("Connecting to MongoDB with URI:", mongoUri ? "[REDACTED]" : mongoUri);

    try {
       await mongoose.connect(mongoUri);
        console.log("Connected to mongo successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message || error);
        process.exit(1);
    }
}

module.exports = connectToMongo;