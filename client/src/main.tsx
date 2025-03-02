import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Home from "./pages/home";
import Browser from "./pages/browser";
import Artwork from "./pages/artwork";
import Den from "./pages/den";
import User from "./pages/user";
import GalleryPage from "./pages/gallery/[id]"; // Added import for GalleryPage


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/browser",
        element: <Browser />,
      },
      {
        path: "/artwork/:id",
        element: <Artwork />,
      },
      {
        path: "/den",
        element: <Den />,
      },
      {
        path: "/user/:id",
        element: <User />,
      },
      {
        path: "/gallery/:id",
        element: <GalleryPage />,
      }, // Added route for GalleryPage
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);