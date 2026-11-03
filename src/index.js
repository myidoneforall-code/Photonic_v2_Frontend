import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { store } from "../src/Components/Store/Config/Store";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.css";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Toaster
      position="bottom-center"
      containerStyle={{
        top: 20,
        left: 20,
        bottom: 60,
        right: 20
      }}
      toastOptions={{
        style: {
          borderRadius: "10px",
          background: "black",
          color: "white"
        }
      }}
    />
    <Provider store={store}>
      <App />
    </Provider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
