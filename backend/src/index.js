// Load environment variables BEFORE any other imports so all modules see them
import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      // Added error event listener
      console.log("ERROR:", error);
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️  Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!!", error);
  });

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error",()=>{
//         console.log("ERROR:", error);
//         throw error
//     });

//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port ${process.env.PORT}`);

//     })
//   } catch (error) {
//     console.error("ERROR:", error);
//     throw err
//   }
// })();
