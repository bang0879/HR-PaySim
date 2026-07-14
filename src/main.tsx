import React from "react";
import ReactDOM from "react-dom/client";
import { SurfaceApp } from "@paysim-surface-entry";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SurfaceApp />
  </React.StrictMode>,
);
