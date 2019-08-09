import React, { useCallback, useState, useEffect, Component } from "react";
import { useDropzone } from "react-dropzone";
import { Dropdown, Grid, Loader, Segment } from "semantic-ui-react";
import { loadFont, drawFont } from "./util";
import Select, { createFilter } from "react-select";
import { FixedSizeList as List } from "react-window";

let selectedFonts = [];
const height = 35;
const available = [
  "abeezee",
  "abel",
  "abhayalibre",
  "abyssinicasil",
  "aclonica",
  "acme",
  "actor",
  "adamina",
  "adventpro",
  "aldrich",
  "alef",
  "alegreya",
  "alegreyasans",
  "alegreyasanssc",
  "alegreyasc",
  "aleo",
  "alice",
  "alike",
  "alikeangular",
  "allerta",
  "allertastencil",
  "almendra",
  "almendrasc",
  "amaranth",
  "amethysta",
  "amiko",
  "amiri",
  "anaheim",
  "andada",
  "andadasc",
  "andika",
  "antic",
  "anticdidone",
  "anticslab",
  "anton",
  "antonio",
  "arapey",
  "arbutusslab",
  "archivo",
  "archivoblack",
  "archivonarrow",
  "arefruqaa",
  "arimo",
  "armata",
  "arsenal",
  "artifika",
  "arvo",
  "arya",
  "asap",
  "asapcondensed",
  "asar",
  "assistant",
  "asul",
  "athiti",
  "average",
  "averagesans",
  "b612",
  "baijamjuree",
  "balthazar",
  "barlow",
  "barlowcondensed",
  "barlowsemicondensed",
  "basic",
  "belgrano",
  "bellefair",
  "belleza",
  "benchnine",
  "bentham",
  "biorhyme",
  "biorhymeexpanded",
  "biryani",
  "bitter",
  "blackandwhitepicture",
  "blackhansans",
  "blinker",
  "brawler",
  "breeserif",
  "brunoace",
  "brunoacesc",
  "bubblerone",
  "buenard",
  "cabin",
  "cabincondensed",
  "cagliostro",
  "cairo",
  "cambay",
  "cambo",
  "candal",
  "cantarell",
  "cantataone",
  "cantoraone",
  "capriola",
  "cardo",
  "carroisgothic",
  "carroisgothicsc",
  "catamaran",
  "caudex",
  "chakrapetch",
  "changa",
  "chathura",
  "chauphilomeneone",
  "chivo",
  "cinzel",
  "codacaption",
  "convergence",
  "cormorant",
  "cormorantgaramond",
  "cormorantinfant",
  "cormorantsc",
  "cormorantunicase",
  "cormorantupright",
  "coustard",
  "creteround",
  "crimsonpro",
  "crimsontext",
  "cuprum",
  "cutive",
  "darkergrotesque",
  "daysone",
  "dellarespira",
  "denkone",
  "dhyana",
  "didactgothic",
  "dmsans",
  "dmserifdisplay",
  "dmseriftext",
  "dohyeon",
  "domine",
  "donegalone",
  "doppioone",
  "dorsa",
  "durusans",
  "ebgaramond",
  "economica",
  "eczar",
  "ekmukta",
  "electrolize",
  "elmessiri",
  "encodesans",
  "encodesanscondensed",
  "encodesansexpanded",
  "encodesanssemicondensed",
  "encodesanssemiexpanded",
  "englebert",
  "enriqueta",
  "exo",
  "exo2",
  "fahkwang",
  "fanwoodtext",
  "farro",
  "faustina",
  "federo",
  "firasans",
  "firasanscondensed",
  "firasansextracondensed",
  "fjallaone",
  "francoisone",
  "frankruhllibre",
  "fresca",
  "gabriela",
  "gafata",
  "galdeano",
  "gayathri",
  "gemunulibre",
  "geo",
  "gfsdidot",
  "gildadisplay",
  "glegoo",
  "gothica1",
  "goudybookletter1911",
  "grenze",
  "gudea",
  "habibi",
  "halant",
  "hammersmithone",
  "hanuman",
  "harmattan",
  "headlandone",
  "heebo",
  "hermeneusone",
  "hind",
  "hindcolombo",
  "hindguntur",
  "hindjalandhar",
  "hindkochi",
  "hindmadurai",
  "hindmysuru",
  "hindsiliguri",
  "hindvadodara",
  "holtwoodonesc",
  "homenaje",
  "ibmplexsans",
  "ibmplexserif",
  "imprima",
  "inder",
  "inika",
  "inknutantiqua",
  "istokweb",
  "italiana",
  "jacquesfrancois",
  "jaldi",
  "jockeyone",
  "josefinsans",
  "josefinsansstdlight",
  "josefinslab",
  "jsmathcmbx10",
  "jsmathcmex10",
  "jsmathcmmi10",
  "jsmathcmr10",
  "jsmathcmsy10",
  "jsmathcmti10",
  "jua",
  "judson",
  "juliussansone",
  "junge",
  "jura",
  "k2d",
  "kadwa",
  "kameron",
  "kanit",
  "karla",
  "karma",
  "khand",
  "khula",
  "kiteone",
  "kodchasan",
  "koho",
  "kottaone",
  "kronaone",
  "krub",
  "kurale",
  "lacquer",
  "laila",
  "lalezar",
  "lato",
  "ledger",
  "lekton",
  "librebaskerville",
  "librecaslondisplay",
  "librecaslontext",
  "librefranklin",
  "lindenhill",
  "literata",
  "livvic",
  "lora",
  "lusitana",
  "lustria",
  "mada",
  "magra",
  "maitree",
  "manjari",
  "manuale",
  "marcellus",
  "marcellussc",
  "markoone",
  "marmelad",
  "martel",
  "martelsans",
  "marvel",
  "mate",
  "matesc",
  "mavenpro",
  "meerainimai",
  "mergeone",
  "merriweather",
  "merriweathersans",
  "metrophobic",
  "michroma",
  "mina",
  "miriamlibre",
  "mitr",
  "molengo",
  "monda",
  "montaga",
  "montserrat",
  "montserratalternates",
  "montserratsubrayada",
  "mousememoirs",
  "mukta",
  "muktamahee",
  "muktamalar",
  "muktavaani",
  "muli",
  "neuton",
  "newscycle",
  "niramit",
  "nobile",
  "notable",
  "noticiatext",
  "notosans",
  "notoserif",
  "numans",
  "nunito",
  "nunitosans",
  "oflsortsmillgoudytt",
  "opensans",
  "opensanscondensed",
  "oranienbaum",
  "orienta",
  "oswald",
  "overpass",
  "oxygen",
  "padauk",
  "palanquin",
  "palanquindark",
  "pathwaygothicone",
  "pattaya",
  "pavanam",
  "paytoneone",
  "petrona",
  "philosopher",
  "play",
  "playfairdisplay",
  "playfairdisplaysc",
  "podkova",
  "poly",
  "pontanosans",
  "poppins",
  "portlligatsans",
  "portlligatslab",
  "pragatinarrow",
  "prata",
  "pridi",
  "prociono",
  "prompt",
  "prozalibre",
  "puritan",
  "quando",
  "quantico",
  "quattrocento",
  "quattrocentosans",
  "questrial",
  "radley",
  "rajdhani",
  "raleway",
  "rambla",
  "rasa",
  "rationale",
  "redhatdisplay",
  "redhattext",
  "reemkufi",
  "rhodiumlibre",
  "roboto",
  "robotocondensed",
  "robotoslab",
  "rokkitt",
  "ropasans",
  "rosario",
  "rosarivo",
  "rozhaone",
  "rubik",
  "rubikmonoone",
  "rubikone",
  "ruda",
  "rufina",
  "rumraisin",
  "russoone",
  "sahitya",
  "saira",
  "sairacondensed",
  "sairaextracondensed",
  "sairasemicondensed",
  "sanchez",
  "sansation",
  "sansita",
  "sarabun",
  "sarala",
  "sarpanch",
  "scada",
  "scheherazade",
  "scopeone",
  "secularone",
  "sedan",
  "sedansc",
  "sharetech",
  "signika",
  "signikanegative",
  "sintony",
  "sixcaps",
  "slabo13px",
  "slabo27px",
  "snippet",
  "solway",
  "songmyung",
  "sortsmillgoudy",
  "sourcesanspro",
  "sourceserifpro",
  "spinnaker",
  "stoke",
  "strait",
  "strong",
  "stylish",
  "suezone",
  "sumana",
  "sunflower",
  "sura",
  "syncopate",
  "tajawal",
  "taviraj",
  "teko",
  "telex",
  "textmeone",
  "thabit",
  "thasadith",
  "tienne",
  "tinos",
  "titilliumweb",
  "trirong",
  "trocchi",
  "trykker",
  "tuffy",
  "ubuntu",
  "ubuntucondensed",
  "ultra",
  "unna",
  "varelaround",
  "varta",
  "vesperlibre",
  "vidaloka",
  "viga",
  "volkhov",
  "vollkornsc",
  "wendyone",
  "wireone",
  "worksans",
  "yaldevicolombo",
  "yanonekaffeesatz",
  "yantramanav",
  "yrsa",
  "zcoolkuaile",
  "zcoolqingkehuangyou",
  "zcoolxiaowei"
];
function renderOptions(fonts) {
  const newFonts = [];
  fonts.forEach(font => {
    let variant = Object.keys(font.files)[0];
    if (available.indexOf(font.family.toLowerCase().replace(/\s+/, "")) > -1) {
      if (font.family.toLowerCase().replace(/\s+/, "") == "mate") {
        console.log(
          "WHOA",
          font.family.toLowerCase().replace(/\s+/, ""),
          variant
        );
      }
      newFonts.push({
        value: font.family.toLowerCase().replace(/\s+/, "") + "/" + variant,
        label: font.family,
        url: font.files[variant]
      });
    }
  });
  console.log("FOUND", newFonts.length);
  return newFonts;
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
