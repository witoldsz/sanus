const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const cwd = p => path.resolve(__dirname, p)

module.exports = {
  entry: './src/app.js',
  target: 'electron-renderer',
  mode: 'production',
  output: {
    filename: 'app.js',
    path: cwd('dist/app/resources/app')
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'node_modules/electron/dist', to: cwd('dist/app') },
      { from: 'node_modules/tachyons/css/tachyons.min.css', to: cwd('dist/app/resources/app') },
      { from: 'src/main.js', to: cwd('dist/app/resources/app') },
      { from: 'src/index.html', to: cwd('dist/app/resources/app') },
      { from: 'package.json', to: cwd('dist/app/resources/app') },
    ])
  ]
};
