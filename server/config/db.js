const mongoose = require('mongoose');

// Function to connect to MongoDB database
const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to MongoDB database at ${mongoose.connection.host}`);
    } catch (error) {
        console.log(`MongoDB connection error message: ${error}`);
    }
}

module.exports = connectdb; // Exporting the connectdb function for use in other files