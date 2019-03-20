module.exports = {
  type: 'preact',
  build: {
    addModernJS: true
  },
  webpack: config => {
    // Add script that runs inside supernova iframe
    config.entry['supernova'] = [config.entry.index[0].replace('index', 'supernova')];

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
