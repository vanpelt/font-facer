import React, { useCallback, useState, useEffect, Component } from "react";
import { useDropzone } from "react-dropzone";
import { Dropdown, Grid, Loader, Segment } from "semantic-ui-react";
import { loadFont, drawFont } from "./util";
import Select, { createFilter } from "react-select";
import { FixedSizeList as List } from "react-window";

let selectedFonts = [];
const height = 35;

function renderOptions(fonts) {
  return fonts.map(font => {
    let variant = Object.keys(font.files)[0];
    return {
      value: font.family.toLowerCase().replace(/\s+/, "") + "/" + variant,
      label: font.family,
      url: font.files[variant]
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
  const [renderedFonts, setRenderedFonts] = useState([]);
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
    //TODO: we should memoize or something
    if (
      !loading &&
      options.length > 0 &&
      (selectedFonts[0] !== props.selectedFonts[0] ||
        selectedFonts[1] !== props.selectedFonts[1])
    ) {
      selectedFonts = props.selectedFonts;
      async function load() {
        //loadLatent(props.fonts[0]);
        setLoading(true);
        const fontaUrl = options.find(o => o.value === selectedFonts[0]).url;
        const fontbUrl = options.find(o => o.value === selectedFonts[1]).url;
        await loadFont(fontaUrl, "fonta");
        await loadFont(fontbUrl, "fontb");
        const fonta = await drawFont("PyTorch", "fonta", selectedFonts[0]);
        const fontb = await drawFont("PyTorch", "fontb", selectedFonts[1]);
        setRenderedFonts([fonta.images, fontb.images]);
        props.setInputs([fonta, fontb]);
        setLoading(false);
      }
      load();
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
              defaultValue={fonts[0]}
              onChange={t => t && props.setFont(t.value, "A")}
            />
            <Segment style={{ fontFamily: "fonta", fontSize: 24 }}>
              PyTorch
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Select
              filterOption={createFilter({ ignoreAccents: false })}
              placeholder="Font B"
              isSearchable={true}
              isClearable={true}
              components={{ MenuList }}
              options={options}
              defaultValue={fonts[1]}
              onChange={t => t && props.setFont(t.value, "B")}
            />
            <Segment style={{ fontFamily: "fontb", fontSize: 24 }}>
              PyTorch
            </Segment>
          </Grid.Column>
        </Grid>
      </Grid.Row>
      <Grid.Row style={{ paddingTop: 40 }}>
        <Grid columns="two">
          <Grid.Column>
            {renderedFonts.length > 0 &&
              !loading &&
              renderedFonts[0].map((url, i) => (
                <img
                  key={"fonta" + i}
                  alt={"Font image"}
                  style={{ maxWidth: 64, maxHeight: 64 }}
                  src={url}
                />
              ))}
          </Grid.Column>
          <Grid.Column>
            {renderedFonts.length > 0 &&
              !loading &&
              renderedFonts[1].map((url, i) => (
                <img
                  key={"fontb" + i}
                  alt={"Font image"}
                  style={{ maxWidth: 64, maxHeight: 64 }}
                  src={url}
                />
              ))}
          </Grid.Column>
        </Grid>
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
