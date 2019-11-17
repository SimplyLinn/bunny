const webpack = require('webpack');
module.exports = {
  lintOnSave: false,
  configureWebpack: {
    module: {
      rules: [
        {
          parser: {amd: false}
        }
      ]
    },
    devServer: {
      allowedHosts: [
        'opposite.biz'
      ]
    }/*
    plugins: [
      new webpack.ProvidePlugin({
        i18next: 'i18next',
      }),
    ]*/
  }
};
