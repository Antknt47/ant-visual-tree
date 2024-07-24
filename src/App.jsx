import React, { useEffect, useState } from "react";
import TreeSvg from "./components/treeSvg/TreeSvg";
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
  const [parsedArray, setParsedArray] = useState([]);

  function loadInput(inputValue) {
    try {
      const parsedArrayTemp = JSON.parse(inputValue);
      if (Array.isArray(parsedArrayTemp)) {
        setParsedArray(parsedArrayTemp);
        localStorage.setItem("serialTreeString", inputValue);
      } else {

      }
    } catch (error) {

    }
  }

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    loadInput(event.target.value);
  };

  useEffect(()=>{
    loadInput(serialTreeString);
  },[])


  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <TreeSvg data={parsedArray}/>
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
            multiline
          />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
