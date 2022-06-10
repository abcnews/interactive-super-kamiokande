const { resolve } = require('path');

module.exports = {
  type: 'preact',
  serve: {
    hot: false
  },
  webpack: config => {
    const rules = config.module.rules;
    const scriptsRule = rules.find(x => x.__hint__ === 'scripts');

    // We need to compile aframe because Ugligfy doesn't like the unmodified source
    scriptsRule.include.push(resolve(__dirname, 'node_modules/aframe'));

    // Stop `import()`-ed chunks from being split into `[name].js` and `vendors~[name].js`
    config.optimization = config.optimization || {};
    config.optimization.splitChunks = {
      cacheGroups: {
        vendors: false
      }
    };

    // Update aliases to use preact@10
    config.resolve.alias.react = 'preact/compat';
    config.resolve.alias['react-dom'] = 'preact/compat';
    delete config.resolve.alias['create-react-class'];

    return config;
  }
};
