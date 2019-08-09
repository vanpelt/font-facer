import React, { useState, useEffect } from "react";
import { Slider } from "react-semantic-ui-range";
import { Grid, Button, Segment } from "semantic-ui-react";
import Output from "./Output";
import { loadFont } from "./util";

export default function Controls(props) {
  const [bold, setBold] = useState(0);
  const [italic, setItalic] = useState(0);
  const [serif, setSerif] = useState(0);
  const [interpolate, setInterpolate] = useState(0);
  const [results, setResults] = useState();
  useEffect(() => {
    console.log("RESULTS", results, props.inputs);
  });
  async function fetchResults(char) {
    //const formData = await loadFont(props.fonts[0], "$A");
    const formData = new FormData();
    formData.append("fonts", JSON.stringify(props.inputs));
    formData.append("coefficients", JSON.stringify({ bold, italic, serif }));
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL + "/predict",
        {
          body: formData,
          method: "post"
        }
      );
      const json = await response.json();
      setResults(json);
      //const face = new FontFace("fontc", "url(" + json.ttf + ")");
      //const font = await face.load();
      //document.fonts.add(font);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <Grid.Column style={{ minWidth: 200, padding: 20 }}>
        <label>Bold</label>
        <Slider
          color="grey"
          settings={{
            min: -1,
            max: 1,
            start: 0,
            step: 0.1,
            onChange: value => setBold(value)
          }}
          value={bold}
        />
        <label>Italic</label>
        <Slider
          color="grey"
          settings={{
            min: -1,
            max: 1,
            start: 0,
            step: 0.1,
            onChange: value => setItalic(value)
          }}
          value={italic}
        />
        <label>Serif</label>
        <Slider
          color="grey"
          settings={{
            min: -1,
            max: 1,
            start: 0,
            step: 0.1,
            onChange: value => setSerif(value)
          }}
          value={serif}
        />
        <label>Interpolate</label>
        <Slider
          color="grey"
          settings={{
            min: 0,
            max: 4,
            start: 0,
            step: 1,
            onChange: value => setInterpolate(value)
          }}
          value={interpolate}
        />
        <Segment>
          {results &&
            results["images"][interpolate] &&
            results["images"][interpolate].map((url, i) => {
              return (
                <img
                  key={"fontc" + i}
                  alt={"Font image"}
                  style={{ maxWidth: 64, maxHeight: 64 }}
                  src={url}
                />
              );
            })}
        </Segment>
        <Button style={{ marginTop: 20 }} onClick={() => fetchResults("$A")}>
          Convert
        </Button>
      </Grid.Column>
      <Grid.Column style={{ minWidth: 300 }}>
        <Output coefficients={{ bold, italic, serif }} />
      </Grid.Column>
    </>
  );
}
