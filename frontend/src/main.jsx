import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/main.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <div className="page">
      <App />
      <ToastContainer />
    </div>
  </>
);
