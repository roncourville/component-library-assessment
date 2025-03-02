/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    require("autoprefixer"),
    require("tailwindcss")("./tailwind.config.ts")
  ],
};


module.exports = config;