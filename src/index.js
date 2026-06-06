import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Admin from "./Admin";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(window.location.pathname === "/admin" ? <Admin /> : <App />);
