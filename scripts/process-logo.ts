import sharp from "sharp";

// Source: 1280x640 landscape logo (sports car silhouette, gold-on-black)
const src = "/home/z/my-project/upload/IMG-20260918-WA0005.jpg";

async function main() {
  // 1) Navbar logo icon — square emblem, gold car on solid black background.
  //    Take the source, resize the car to fit width 200, then center on a 256x256 black canvas.
  const navbarOut = "/home/z/my-project/public/logo-mark.png";

  // Resize the source preserving aspect ratio (car fills width 200, height becomes 100)
  const carBuffer = await sharp(src)
    .resize({ width: 200, height: 100, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .flatten({ background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toBuffer();

  // Composite onto a 256x256 solid black canvas
  await sharp({
    create: {
      width: 256, height: 256, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: carBuffer, top: 78, left: 28 }])
    .png()
    .toFile(navbarOut);
  console.log("Navbar mark saved (256x256 black emblem):", navbarOut);

  // 2) Favicons — same black emblem style, smaller sizes
  const carBuffer64 = await sharp(src)
    .resize({ width: 56, height: 28, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .flatten({ background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
    .composite([{ input: carBuffer64, top: 18, left: 4 }])
    .png()
    .toFile("/home/z/my-project/public/favicon-64.png");
  console.log("Favicon 64 saved");

  const carBuffer180 = await sharp(src)
    .resize({ width: 140, height: 70, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .flatten({ background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
    .composite([{ input: carBuffer180, top: 55, left: 20 }])
    .png()
    .toFile("/home/z/my-project/public/apple-icon.png");
  console.log("Apple icon (180x180) saved");

  // 3) Full landscape logo (for footer / about page) — original aspect, max width 600
  await sharp(src)
    .resize({ width: 600, withoutEnlargement: true })
    .flatten({ background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toFile("/home/z/my-project/public/logo-full.png");
  console.log("Full landscape logo saved");
}

main().catch((e) => { console.error(e); process.exit(1); });
