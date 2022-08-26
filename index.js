const fs = require("fs");
const path = require("path");

const image = path.join(__dirname, "avatar_origami_monkey.png");

const data = fs.readFileSync(image, { encoding: "binary" });
console.log({ data });

const buffer = Buffer.from(data, "binary");
console.log({ buffer, length: buffer.length });

const base64 = buffer.toString("base64");
console.log({ base64 });

const dataUrl = `data:image/png;base64,${base64}`;
console.log({ dataUrl });
