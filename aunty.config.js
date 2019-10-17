module.exports = {
  type: 'preact',
  build: {
    addModernJS: true
  },
  serve: {
    hot: false
  },
  webpack: config => {
    // Stop `import()`-ed chunks from being split into `[name].js` and `vendors~[name].js`
    config.optimization = config.optimization || {};
    config.optimization.splitChunks = {
      cacheGroups: {
        vendors: false
      }
    };

    return config;
  }
};
