// Load environment variables BEFORE any other imports so all modules see them
import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Server error:", error);
    });

    app.listen(process.env.PORT || 8000, () => {
      // Server started
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error",()=>{
//         
//         throw error
//     });

//     app.listen(process.env.PORT,()=>{
//         

//     })
//   } catch (error) {
//     console.error("ERROR:", error);
//     throw err
//   }
// })();
