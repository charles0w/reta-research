import React from "react";
import ReactDOM from "react-dom/client";
import { MoonPayProvider } from "@moonpay/moonpay-react";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <MoonPayProvider apiKey="pk_test_key" debug>
    <App />
  </MoonPayProvider>
);
