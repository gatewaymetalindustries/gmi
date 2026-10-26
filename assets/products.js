// Gateway catalogue. One entry per standard tin.
// `img` is the photo-set number in img/p/{sm,lg}/<img>.<1-3>.jpg
// `dims` are outside dimensions in cm: round = [diameter, height], rect = [length, width, height]
window.GMI_USES = {
  spice:    { label: 'Spices & food',      short: 'Food' },
  paint:    { label: 'Paints & adhesives', short: 'Paint' },
  chemical: { label: 'Dyes & chemicals',   short: 'Chemical' },
  general:  { label: 'General purpose',    short: 'General' }
};

window.GMI_PRODUCTS = [
  { id: 'gmi-02', img: 2,  name: 'Round cookie tin, large',     shape: 'round', dims: [19, 7],          use: 'spice',    fill: null,     lid: 'Slip lid' },
  { id: 'gmi-04', img: 4,  name: 'Round cookie tin, medium',    shape: 'round', dims: [13, 6],          use: 'spice',    fill: null,     lid: 'Slip lid' },
  { id: 'gmi-15', img: 15, name: 'Curry powder box, 125 g',     shape: 'rect',  dims: [7.5, 5.5, 7],    use: 'spice',    fill: '125 g',  lid: null },
  { id: 'gmi-18', img: 18, name: 'Curry powder box, 250 g',     shape: 'rect',  dims: [7.5, 5.5, 12.5], use: 'spice',    fill: '250 g',  lid: null },
  { id: 'gmi-19', img: 19, name: 'Curry powder box, 500 g',     shape: 'rect',  dims: [11, 8, 12.5],    use: 'spice',    fill: '500 g',  lid: null },
  { id: 'gmi-13', img: 13, name: 'Paint & adhesive tin, 50 ml', shape: 'round', dims: [5.5, 4],        use: 'paint',    fill: '50 ml',  lid: 'Lever lid' },
  { id: 'gmi-14', img: 14, name: 'Paint & adhesive tin, 100 ml',shape: 'round', dims: [5.5, 6],        use: 'paint',    fill: '100 ml', lid: 'Lever lid' },
  { id: 'gmi-16', img: 16, name: 'Paint & adhesive tin, 200 ml',shape: 'round', dims: [7.5, 6],        use: 'paint',    fill: '200 ml', lid: 'Lever lid' },
  { id: 'gmi-17', img: 17, name: 'Paint & adhesive tin, 500 ml',shape: 'round', dims: [8.5, 11],       use: 'paint',    fill: '500 ml', lid: 'Lever lid' },
  { id: 'gmi-08', img: 8,  name: 'Dyes & chemical box, 1 kg',   shape: 'rect',  dims: [16, 16, 12.5],   use: 'chemical', fill: '1 kg',   lid: null },
  { id: 'gmi-09', img: 9,  name: 'Dyes & chemical box, 1 kg tall', shape: 'rect', dims: [15.5, 15.5, 19], use: 'chemical', fill: '1 kg', lid: null },
  { id: 'gmi-03', img: 3,  name: 'Square container',            shape: 'rect',  dims: [6.5, 6.5, 6.5],  use: 'general',  fill: null,     lid: null },
  { id: 'gmi-05', img: 5,  name: 'Flat rectangular tin, small', shape: 'rect',  dims: [14.5, 9, 4],     use: 'general',  fill: null,     lid: null },
  { id: 'gmi-06', img: 6,  name: 'Flat rectangular tin, medium',shape: 'rect',  dims: [17, 13, 5.5],    use: 'general',  fill: null,     lid: null },
  { id: 'gmi-10', img: 10, name: 'Rectangular tin, large',      shape: 'rect',  dims: [25, 15, 6.5],    use: 'general',  fill: null,     lid: null },
  { id: 'gmi-11', img: 11, name: 'Rectangular tin, deep',       shape: 'rect',  dims: [26, 15, 8],      use: 'general',  fill: null,     lid: null },
  { id: 'gmi-12', img: 12, name: 'Rectangular tray tin, XL',    shape: 'rect',  dims: [33, 22.5, 5],    use: 'general',  fill: null,     lid: null },
  { id: 'gmi-01', img: 1,  name: 'Mini round box',              shape: 'round', dims: [5, 1.5],         use: 'general',  fill: null,     lid: null },
  { id: 'gmi-07', img: 7,  name: 'Mini rectangular box',        shape: 'rect',  dims: [6, 4.5, 1.5],    use: 'general',  fill: null,     lid: null }
];

window.GMI_fmtDims = function (p) {
  var n = function (v) { return String(v); };
  return p.shape === 'round'
    ? 'Ø ' + n(p.dims[0]) + ' × ' + n(p.dims[1]) + ' cm'
    : p.dims.map(n).join(' × ') + ' cm';
};
