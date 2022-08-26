const fs = require("fs");
const path = require("path");

const image = path.join(__dirname, "avatar_origami_monkey.png");

const data = fs.readFileSync(image, { encoding: "binary" });
console.log({ data });

const buffer = Buffer.from(data, "binary");
console.log({ buffer, length: buffer.length });

const base64 = buffer.toString("base64");
console.log({ base64 });

const dataUrl = `data:image/jpeg;base64,${base64}`;
console.log({ dataUrl });

function toBase64(arr) {
  return btoa(arr.reduce((data, byte) => data + String.fromCharCode(byte), ""));
}
const base64_1 = toBase64(buffer);
console.log({ base64_1 });


// https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
// https://stackoverflow.com/questions/42800419/converting-html-canvas-to-binary-image-data
// https://gergelykonczdotcom.wordpress.com/2014/07/20/draw-binary-image-to-the-html5-canvas/
// https://developer.mozilla.org/en-US/docs/Web/API/Blob
// https://blog.csdn.net/liuarmyliu/article/details/109721795
// https://laracasts.com/discuss/channels/javascript/javascript-binary-image
// https://www.cnblogs.com/poorpeople/p/9407789.html
// https://stackoverflow.com/questions/32666458/node-js-canvas-image-data