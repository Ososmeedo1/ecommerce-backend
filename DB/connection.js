import mongoose from "mongoose"

export default async function dbConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("DB connected");
  } catch (error) {
    console.log("DB failure", error.message);
    
  }
}