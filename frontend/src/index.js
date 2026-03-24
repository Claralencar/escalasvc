import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

console.log("INDEX.JS CARREGOU");

const rootElement = document.getElementById("root");
console.log("ROOT ELEMENT:", rootElement);

const root = ReactDOM.createRoot(rootElement);

root.render(<App />);