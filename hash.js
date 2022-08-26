const fs = require("fs");
const axios = require("axios");
const sharp = require("sharp");
const { encode, decode } = require("blurhash");

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
    const { data } = await axios.get(v, {
      headers: {
        accept: "image/*",
      },
      responseType: "arraybuffer",
    });

    const rawImg = sharp(data);
    const rawMeta = await rawImg.metadata();
    const ratio = rawMeta.width / rawMeta.height;
    console.log({ rawMeta });

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

    if (config[rawMeta.format]) {
      await rawImg[rawMeta.format](config[rawMeta.format]);
    }

    const _w = ratio >= 1 ? Math.min(size, rawMeta.width) : null;
    const _h = ratio < 1 ? Math.min(size, rawMeta.height) : null;
    const resizedBuf = await rawImg.resize(_w, _h).toBuffer();
    const resizedImg = await sharp(resizedBuf);
    const resizedMeta = await resizedImg.metadata();
    console.log({ resizedMeta });

    const resizedBase64 = `data:image/${resizedMeta.format};base64,${resizedBuf.toString("base64")}`;
    console.log({ resizedBase64 });

    const imageData = await resizedImg.raw().ensureAlpha().toBuffer();
    console.log({ imageData });

    const hash = encode(new Uint8ClampedArray(imageData), resizedMeta.width, resizedMeta.height, 4, 4);
    console.log({ hash });

    let _width;
    let _height;
    if (ratio >= 1) {
      _width = size;
      _height = Math.floor(size / ratio);
    } else {
      _width = Math.floor(size * ratio);
      _height = size;
    }
    const hashPixels = decode(hash, _width, _height);

    const hashImg = await sharp(hashPixels, {
      raw: {
        width: _width,
        height: _height,
        channels: 4,
      },
    });
    const hashBuf = await hashImg.toFormat(rawMeta.format).toBuffer();
    const hashBase64 = `data:image/${rawMeta.format};base64,${hashBuf.toString("base64")}`;

    return {
      url: v,
      width: rawMeta.width,
      height: rawMeta.height,
      format: rawMeta.format,

      thumb: {
        width: resizedMeta.width,
        height: resizedMeta.height,
        base64: resizedBase64,
        hash,
        hashBase64,
      },
    };
  })
)
  .then((res) => {
    fs.writeFileSync("./hash.json", JSON.stringify(res, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });
