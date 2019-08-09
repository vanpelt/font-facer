import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Dropdown, Grid, Loader } from "semantic-ui-react";
import { loadFont } from "./util";

let font = null;
const Items = React.memo(({ which, fonts, setFont }) => {
  return fonts.map(font => {
    return (
      <Dropdown.Item key={font.family}>
        <Dropdown text={font.family}>
          <Dropdown.Menu>
            {Object.keys(font.files).map(k => (
              <Dropdown.Item
                onClick={(e, d) =>
                  setFont(font.family + "/" + k, which, font.files[k])
                }
                key={font.family + k}
              >
                {k}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Dropdown.Item>
    );
  });
});

export default function Input(props) {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [loading, setLoading] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [queries, setQueries] = useState(["", ""]);
  async function loadLatent(font) {
    setLoading(true);
    const formData = await loadFont(font, "$A");
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL + "/encode",
        {
          body: formData,
          method: "post"
        }
      );
      const json = await response.json();
      console.log("JSON", json);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }
  async function loadFonts() {
    const cache = localStorage.getItem("webFonts");
    if (cache) {
      setFonts(JSON.parse(cache));
    } else {
      const res = await fetch(
        "https://www.googleapis.com/webfonts/v1/webfonts?key=" +
          process.env.REACT_APP_FONT_KEY
      );
      const fonts = (await res.json()).items;
      setFonts(fonts);
      localStorage.setItem("webFonts", JSON.stringify(fonts));
    }
  }

  useEffect(() => {
    if (!loading && font != props.fonts[0]) {
      font = props.fonts[0];
      loadLatent(props.fonts[0]);
    }
    console.log("WHOA", fonts);
    if (fonts.length === 0) {
      loadFonts();
    }
  });

  return (
    <Grid.Column style={{ position: "relative" }}>
      <Grid.Row />
      <Grid.Row style={{ paddingTop: 20 }}>
        <Grid columns="two">
          <Grid.Column>
            <Dropdown
              placeholder="Font A"
              search
              fluid
              searchQuery={queries[0]}
              onSearchChange={(e, { searchQuery }) =>
                setQueries([searchQuery, queries[1]])
              }
            >
              <Dropdown.Menu>
                <Items which="A" fonts={fonts} setFont={props.setFont} />
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
          <Grid.Column>
            <Dropdown
              placeholder="Font B"
              search
              fluid
              searchQuery={queries[1]}
              onSearchChange={(e, { searchQuery }) =>
                setQueries([queries[0], searchQuery])
              }
            >
              <Dropdown.Menu>
                <Items which="B" fonts={fonts} setFont={props.setFont} />
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
        </Grid>
      </Grid.Row>
      <Grid.Row style={{ paddingTop: 40 }}>
        <>
          {props.fonts &&
            ["$H", "$A", "$C", "$K"].map(letter => (
              <img
                key={letter}
                alt={letter}
                style={{ maxWidth: 64, maxHeight: 64 }}
                src={
                  process.env.PUBLIC_URL +
                  "/fonts/" +
                  props.fonts[0] +
                  "/svg/" +
                  letter +
                  ".svg"
                }
              />
            ))}
        </>
        <div style={{ paddingTop: 100 }}>
          <Loader active={loading} />
        </div>
      </Grid.Row>
      {false && (
        <div {...getRootProps()} style={{ maxWidth: 300 }}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
      )}
    </Grid.Column>
  );
}
