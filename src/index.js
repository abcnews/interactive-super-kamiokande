import capiFetch from '@abcnews/capi-fetch';
import { loadOdysseyScrollyteller } from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, render } from 'preact';
import App from './components/App';
import styles from './styles.css';

let scrollyteller;
let assets;

function renderApp() {
  render(
    <App assets={assets} panels={scrollyteller.panels} />,
    scrollyteller.mountNode,
    scrollyteller.mountNode.firstChild
  );
}

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      renderApp();
    } catch (err) {
      import('./components/ErrorBox').then(exports => {
        const ErrorBox = exports.default;
        render(<ErrorBox error={err} />, scrollyteller.mountNode, scrollyteller.mountNode.firstChild);
      });
    }
  });
}

function init() {
  scrollyteller = loadOdysseyScrollyteller('superk', cn('u-full', styles.mountNode));

  fetchAssets(scrollyteller.panels)
    .then(_assets => {
      assets = _assets;
      renderApp();
    })
    .catch(err => {
      console.error(err);
    });
}

const ASSET_TAGNAMES = {
  CustomImage: 'img',
  Video: 'video'
};

function fetchAssets(panels) {
  return new Promise((resolve, reject) => {
    const assetCMIDs = panels.reduce((memo, panel) => {
      const assetCMID = panel.config.asset;

      if (assetCMID && memo.indexOf(assetCMID) === -1) {
        memo.push(assetCMID);
      }

      return memo;
    }, []);

    Promise.all(
      assetCMIDs.map(
        assetCMID =>
          new Promise((resolve, reject) => {
            capiFetch(assetCMID, (err, doc) => {
              if (err) {
                return reject(err);
              }

              const tagName = ASSET_TAGNAMES[doc.docType];

              if (!tagName) {
                return reject(new Error(`Unsupported asset type: ${doc.docType}`));
              }

              resolve({
                id: doc.id,
                tagName,
                src: (doc.renditions || doc.media)[0].url
              });
            });
          })
      )
    )
      .then(assets => resolve(assets))
      .catch(err => {
        reject(err);
      });
  });
}

if (window.__ODYSSEY__) {
  init();
} else {
  window.addEventListener('odyssey:api', init);
}

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
}
