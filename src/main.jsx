import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

import App from "./App";
import "./styles/index.css";
import "./styles/admin.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        primaryColor: "green",
        colors: {
          green: [
            "#F2FBF7",
            "#DFF6EE",
            "#BFEBDD",
            "#9FE0CC",
            "#7FD5BB",
            "#5FCAAA",
            "#3FBF99",
            "#2FBF9F",
            "#1F8A70",
            "#f0f0f0ff",
          ],
        },
        fontFamily: "Urbanist, sans-serif",
      }}
    >
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
