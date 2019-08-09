import React, { useState } from "react";
import "./App.css";
import Input from "./Input";
import Controls from "./Controls";
import { Grid } from "semantic-ui-react";

function App() {
  const [fontA, setFontA] = useState("opensans/300");
  const [fontB, setFontB] = useState("gothica1/100");
  return (
    <div className="App">
      <header className="App-header">
        <h1>Font Facer</h1>
      </header>
      <Grid columns="three" style={{ padding: 30 }}>
        <Input
          setFont={(value, which) => {
            if (which === "A") {
              setFontA(value);
            } else {
              setFontB(value);
            }
          }}
          fonts={[fontA, fontB]}
        />
        <Controls fonts={[fontA, fontB]} />
      </Grid>
    </div>
  );
}

export default App;
