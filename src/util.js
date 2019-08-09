export function getLatent(input) {
  fetch();
}
export function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach(b => (binary += String.fromCharCode(b)));

  return window.btoa(binary);
}
export async function loadFontImage(font, char, format = "png") {
  /*Loads a font from the public directory returns FormData */
  const png = await fetch(
    process.env.PUBLIC_URL +
      "/fonts/" +
      font +
      "/" +
      format +
      "/" +
      char +
      "." +
      format
  );
  const buffer = await png.arrayBuffer();
  const formData = new FormData();
  formData.append("image", arrayBufferToBase64(buffer));
  return formData;
}
export function loadFont(url, name) {
  const promise = new Promise(async (resolve, reject) => {
    const face = new FontFace(name, "url(" + url + ")");
    const font = await face.load();
    document.fonts.add(font);
    await face.loaded;
    resolve(face);
  });

  return promise;
}
export function drawFont(text, face, name, size = 64, padding = 5) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.font = size - padding * 2 + "px " + face;
  ctx.textBaseline = "bottom";

  const images = { name: name, images: [], chars: [] };
  for (var i = 0; i < text.length; i++) {
    let char = text.charAt(i);
    ctx.fillText(char, padding, size - padding);
    images["images"].push(canvas.toDataURL("image/png"));
    if (char === char.toUpperCase()) {
      char = "$" + char;
    }
    images["chars"].push(char);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  return images;
}
