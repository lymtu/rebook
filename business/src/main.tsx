import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "@/router";
import ContextProvider from "@/context";

createRoot(document.getElementById("root")!).render(
  <ContextProvider>
    <Router />
  </ContextProvider>
);
