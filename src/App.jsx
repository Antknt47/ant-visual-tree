import React, { useState } from "react";
import TreeSvg from "./components/treeSvg/TreeSvg"
import { TextField, ThemeProvider, createTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(); // 使用 useTranslation 钩子
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
            label={t('label')}
            variant="filled"
            helperText={t('helperText')}
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
