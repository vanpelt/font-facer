import React, { useCallback, useState, useEffect, Component } from "react";
import { useDropzone } from "react-dropzone";
import { Dropdown, Grid, Loader } from "semantic-ui-react";
import { loadFont } from "./util";
import Select, { createFilter } from "react-select";
import { FixedSizeList as List } from "react-window";

let font = null;
const height = 35;

function renderOptions(fonts) {
  return fonts.map(font => {
    let variant = Object.keys(font.files)[0];
    return {
      value: font.family.toLowerCase().replace(/\s+/, "") + "/" + variant,
      label: font.family
    };
  });
}

class MenuList extends Component {
  render() {
    const { options, children, maxHeight, getValue } = this.props;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
      <List
        height={maxHeight}
        itemCount={children.length}
        itemSize={height}
        initialScrollOffset={initialOffset}
      >
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </List>
    );
  }
}

export default function Input(props) {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [loading, setLoading] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [options, setOptions] = useState([]);
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
    if (fonts.length === 0) {
      loadFonts();
    } else if (options.length === 0) {
      setOptions(renderOptions(fonts));
    }
  });
  return (
    <Grid.Column style={{ position: "relative" }}>
      <Grid.Row />
      <Grid.Row style={{ paddingTop: 20 }}>
        <Grid columns="two">
          <Grid.Column>
            <Select
              filterOption={createFilter({ ignoreAccents: false })}
              placeholder="Font A"
              isSearchable={true}
              isClearable={true}
              components={{ MenuList }}
              options={options}
              onChange={t => t && setFonts([t.value, fonts[1]])}
            />
          </Grid.Column>
          <Grid.Column>
            <Select
              filterOption={createFilter({ ignoreAccents: false })}
              placeholder="Font B"
              isSearchable={true}
              isClearable={true}
              components={{ MenuList }}
              options={options}
              onChange={t => t && setFonts([fonts[0], t.value])}
            />
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
