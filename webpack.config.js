const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/scripts/background.ts',
    'gh-pages-bridge': './src/scripts/gh-pages-bridge.ts',
    'wallet-connect-script': './src/scripts/wallet-connect-script.ts',
    'solana-wallet': './src/scripts/solana-wallet.ts',
    'wallet-detector': './src/scripts/wallet-detector.ts',
  },
  output: {
    path: path.resolve(__dirname, 'extension-build'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/index.html', to: 'index.html' },
        { from: 'public/wallet-connect.html', to: 'wallet-connect.html' },
        { from: 'public/popup.css', to: 'popup.css' },
        { from: 'public/popup.js', to: 'popup.js' },
        { from: 'public/content.js', to: 'content.js' },
        { from: 'public/icons', to: 'icons' },
        { from: 'public/*.svg', to: '[name][ext]' },
      ],
    }),
  ],
}; 