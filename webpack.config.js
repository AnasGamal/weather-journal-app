// webpack.config.js

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/app.js', 
  output: {
    filename: 'bundle.js', // name of the bundled output file
    path: path.resolve(__dirname, 'dist'), // output directory
  },
};
