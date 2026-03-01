import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./styles/global.css";
import Home from "./routes/Home";
import EditPaper from "./routes/EditPaper";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/edit/:id", element: <EditPaper /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
