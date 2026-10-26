# gatewaymetalindustries.com

Static site for Gateway Metal Industries, hosted on GitHub Pages (`CNAME`). No build step: edit the files and push.

| File | What it is |
| --- | --- |
| `index.html`, `products.html`, `about.html`, `contact.html`, `404.html` | Pages. The header and footer are repeated in each, so change them everywhere. |
| `assets/site.css` | All styles. Colours and fonts are the variables at the top. |
| `assets/products.js` | **The catalogue.** Add or edit a tin here and it updates the catalogue, viewer, quote list and 3D picker. |
| `assets/site.js` | Menu, quote list (saved in the visitor's browser), toast messages. |
| `assets/catalogue.js` | Catalogue filters, photo viewer, quote tray. |
| `assets/contact.js` | Quote form → opens WhatsApp or email with the request filled in. |
| `assets/tin3d.js` | 3D tin on the home page (three.js from jsDelivr). Falls back to a photo if WebGL is unavailable. |
| `img/p/sm`, `img/p/lg` | Product photos, 720 px and 1400 px JPEGs. Name them `<img number>.<1-3>.jpg`. |
| `img/gmi.svg` | Logo. |

## Adding a product

1. Export 3 photos and save them as `img/p/sm/20.1.jpg` … `20.3.jpg` (720 px wide) and `img/p/lg/20.1.jpg` … (1400 px).
   On a Mac: `sips -Z 720 -s format jpeg -s formatOptions 74 photo.png --out img/p/sm/20.1.jpg`
2. Add a line to `assets/products.js` with `img: 20`.

## Preview locally

    python3 -m http.server 8000

then open http://localhost:8000.
