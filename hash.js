const fs = require("fs");
const axios = require("axios");
const sharp = require("sharp");
const { encode } = require("blurhash");

const images = [
  "https://s3.bmp.ovh/imgs/2022/07/31/046c0507a3cccc7c.jpg",
  "https://s3.bmp.ovh/imgs/2022/07/31/fac5aac462ea456b.jpg",
  "https://s3.bmp.ovh/imgs/2022/07/31/3ce7caf77daa82a1.jpg",
  "https://s3.bmp.ovh/imgs/2022/07/31/f55b4245d2b1300f.jpg",
  "https://s3.bmp.ovh/imgs/2022/07/31/29895487f61360a5.jpg",
  "https://s3.bmp.ovh/imgs/2022/07/31/cfaa565bfc43425b.jpeg",
  "https://s3.bmp.ovh/imgs/2022/07/31/899c6168c03b07f9.png",
  "https://s3.bmp.ovh/imgs/2022/07/31/835070e3652df556.png",
];

const size = 32;

Promise.all(
  images.map(async (v) => {
    const { data } = await axios.get(v, { responseType: "arraybuffer" });

    const image = sharp(data);
    const meta = await image.metadata();
    console.log(meta);

    const config = {
      jpeg: {
        quality: 75,
        chromaSubsampling: "4:2:0",
        quantisationTable: 3,
        trellisQuantisation: true,
        overshootDeringing: true,
      },
      png: {
        palette: true,
        quality: 100,
        colors: 128,
        compressionLevel: 9,
        effort: 10,
      },
    };

    if (config[meta.format]) {
      await image[meta.format](config[meta.format]);
    }

    const resized = await image.resize(meta.width >= meta.height ? Math.min(size, meta.width) : null, meta.width <= meta.height ? Math.min(size, meta.height) : null).toBuffer();

    const resizedMeta = await sharp(resized).metadata();
    console.log(resizedMeta);

    const base64 = `data:image/${meta.format};base64,${resized.toString("base64")}`;
    console.log(base64);

    const imageData = await image.raw().ensureAlpha().toBuffer();

    const hash = encode(new Uint8ClampedArray(imageData), resizedMeta.width, resizedMeta.height, 4, 4);
    console.log(hash);

    return {
      url: v,
      width: meta.width,
      height: meta.height,
      format: meta.format,

      preview: {
        width: resizedMeta.width,
        height: resizedMeta.height,
        format: resizedMeta.format,
        base64,
        hash,
      },
    };
  })
).then((res) => {
  console.log(
    res.map((v) => {
      return {
        url: v.url,
        format: v.format,
        width: v.width,
        height: v.height,
        hash: v.preview.hash,
      };
    })
  );
  fs.writeFileSync("./hash.json", JSON.stringify(res, null, 2));
});
