import React, { useState } from "react";
import TreeSvg from "./components/treeSvg/TreeSvg.jsx"
import { TextField, ThemeProvider, createTheme } from '@mui/material';
import "./App.css"

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  let defualtSerialTreeString = localStorage.getItem("serialTreeString");
  if(!defualtSerialTreeString) {
    defualtSerialTreeString = "[1,2,3,4,5,null,7,8]";
  }
  const [serialTreeString, setSerialTreeString] = useState(defualtSerialTreeString);

  const handleInputChange = (event) => {
    setSerialTreeString(event.target.value);
    localStorage.setItem("serialTreeString", event.target.value)
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <TreeSvg data={serialTreeString}/>
        <div className="overlay">
          {false && <button className="button">按钮</button>}
        </div>
        <div className="top-right">
          <TextField 
            className="serialInput"
            id="filled-basic"
            label="层序字符串"
            variant="filled"
            helperText="例如: [1,2,3,4,5,null,7,8]"
            defaultValue={serialTreeString}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
