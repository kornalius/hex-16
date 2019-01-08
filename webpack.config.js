var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
  entry: './src/main.js',

  output: {
    path: './build',
    filename: 'bundle.js',
  },

  devtool: 'inline-source-map',

  module: {
    loaders: [
      {
        test: /\.js$/i,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },

      {
        test: /\.json$/i,
        loader: 'json'
      },

      {
        test: /\.html$/i,
        loader: 'html'
      },

      {
        test: /\.css$/i,
        loaders: ['style', 'css', 'cssnext']
      },

      {
        test: /\.(png|jpg|wav)$/i,
        loader: 'url-loader'
      },

    ]
  },

  cssnext : {
    features : {
      import : {
        path : ['./style']
      }
    }
  },

  plugins: [
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3001,
      server: { baseDir: ['./'] },
      browser: "google chrome",
      notify: false
    }),
  ],

};
