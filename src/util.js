export function getLatent(input) {
  fetch();
}
export function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach(b => (binary += String.fromCharCode(b)));

  return window.btoa(binary);
}
export async function loadFont(font, char, format = "png") {
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
