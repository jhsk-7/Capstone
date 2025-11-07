import mongoose from "mongoose";

/*export async function connect() {
    try {
        mongoose.connect(process.env.MONGO_URL);
        const connection = mongoose.connection;

        connection.on('connected',() => {
            console.log('Successfully connected to MongoDB')
        })

        connection.on('error', (err) => {
            console.log('MongoDB connection error.' + err);
            process.exit();
        })

    } catch (error) {
        console.log('Something goes wrong!')
        console.log(error)
    }
}*/