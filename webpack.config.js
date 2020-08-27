const path = require('path');

var babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: ["@babel/preset-env"],
    plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
          regenerator: true,
        }
      ]
    ],
  }
};

module.exports = {
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          babelLoader,
          {
            loader: 'ts-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '.'),
  },
};
