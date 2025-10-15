export const pastelColors = [
  { name: "Pastel Pink",      hex: "#ffd1dc" },
  { name: "Pastel Purple",    hex: "#c3b1e1" },
  { name: "Pastel Blue",      hex: "#aec6cf" },
  { name: "Pastel Green",     hex: "#b0eacd" },
  { name: "Pastel Yellow",    hex: "#fffac8" },
  { name: "Pastel Orange",    hex: "#ffb347" },
  { name: "Pastel Red",       hex: "#ff6961" },
  { name: "Pastel Mint",      hex: "#77dd77" },
  { name: "Pastel Lilac",     hex: "#e0bbec" },
  { name: "Pastel Peach",     hex: "#ffd8b1" },
  { name: "Pastel Cyan",      hex: "#b2fefa" },
  { name: "Pastel Teal",      hex: "#99e6e6" },
  { name: "Pastel Lavender",  hex: "#e3e4fa" },
  { name: "Pastel Magenta",   hex: "#ffb3de" },
  { name: "Pastel Brown",     hex: "#cfcfc4" }
];

export const randomHex = () => pastelColors[Math.floor(Math.random() * pastelColors.length)].hex;
