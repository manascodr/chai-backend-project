import http from "http";
import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { initializeSocket } from "./socket/index.js";

const server = http.createServer(app); // Create an HTTP server using the Express app
export const io = initializeSocket(server); // Initialize socket.io with the server

connectDB()
  .then(() => {
    server.on("error", (error) => {
      console.error("Server error:", error);
    });

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`⚙️ Server is running at port: ${PORT}`);
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
