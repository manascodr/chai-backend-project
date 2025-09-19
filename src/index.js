import dotenv from "dotenv";

import express from "express";
import connectDB from "./db/index.js";

dotenv.config();

const app = express();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!!", err);
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
