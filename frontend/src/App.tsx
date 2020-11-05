import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Box } from "@material-ui/core";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { Navbar } from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Navbar />
        <Box paddingTop={"70px"}> 
          <Breadcrumbs/>  
          <AppRouter/>
        </Box>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
