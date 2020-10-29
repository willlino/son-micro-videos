import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { Page } from "./components/Page";
import { Box } from "@material-ui/core";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Navbar />
        <Box paddingTop={"70px"}> 
          <AppRouter/>
        </Box>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
