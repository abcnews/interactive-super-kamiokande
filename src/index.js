import capiFetch from '@abcnews/capi-fetch';
import { loadOdysseyScrollyteller } from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, render } from 'preact';
import SuperK from './components/SuperK';
import Supernova from './components/Supernova';
import styles from './styles.css';

let superkScrollyteller;
let supernovaScrollyteller;
let assets;
let schedulerReference;

function renderSuperK() {
  if (schedulerReference) {
    window.__ODYSSEY__.scheduler.unsubscribe(schedulerReference);
  }

  render(
    <SuperK assets={assets} panels={superkScrollyteller.panels} />,
    superkScrollyteller.mountNode,
    superkScrollyteller.mountNode.firstChild
  );

  let mountNodeOpacity = null;

  schedulerReference = client => {
    const box = superkScrollyteller.mountNode.getBoundingClientRect();
    const nextMountNodeOpacity = Math.max(0, Math.min(box.bottom - client.height, client.height)) / client.height;

    if (mountNodeOpacity !== nextMountNodeOpacity) {
      mountNodeOpacity = nextMountNodeOpacity;
      superkScrollyteller.mountNode.style.opacity = mountNodeOpacity;
    }
  };

  window.__ODYSSEY__.scheduler.subscribe(schedulerReference);
}

function renderSupernova() {
  render(
    <Supernova panels={supernovaScrollyteller.panels} />,
    supernovaScrollyteller.mountNode,
    supernovaScrollyteller.mountNode.firstChild
  );
}

if (module.hot) {
  module.hot.accept('./components/SuperK', () => {
    try {
      renderSuperK();
    } catch (err) {
      import('./components/ErrorBox').then(exports => {
        const ErrorBox = exports.default;
        render(<ErrorBox error={err} />, superkScrollyteller.mountNode, superkScrollyteller.mountNode.firstChild);
      });
    }
  });
}

if (module.hot) {
  module.hot.accept('./components/Supernova', () => {
    try {
      renderSupernova();
    } catch (err) {
      import('./components/ErrorBox').then(exports => {
        const ErrorBox = exports.default;
        render(<ErrorBox error={err} />, supernovaScrollyteller.mountNode, supernovaScrollyteller.mountNode.firstChild);
      });
    }
  });
}

function init() {
  // SuperK

  try {
    superkScrollyteller = loadOdysseyScrollyteller('superk', cn('u-full', styles.mountNode));
  } catch (e) {}

  if (superkScrollyteller && superkScrollyteller.mountNode) {
    while (superkScrollyteller.mountNode.nextElementSibling.tagName === 'A') {
      window.__ODYSSEY__.utils.dom.detach(superkScrollyteller.mountNode.nextElementSibling);
    }

    fetchAssets(superkScrollyteller.panels)
      .then(_assets => {
        assets = _assets;
        renderSuperK();
      })
      .catch(err => {
        console.error(err);
      });
  }

  // Supernova

  try {
    supernovaScrollyteller = loadOdysseyScrollyteller('supernova', cn('u-full', styles.mountNode));
  } catch (e) {}

  if (supernovaScrollyteller && supernovaScrollyteller.mountNode) {
    while (supernovaScrollyteller.mountNode.nextElementSibling.tagName === 'A') {
      window.__ODYSSEY__.utils.dom.detach(supernovaScrollyteller.mountNode.nextElementSibling);
    }

    renderSupernova();
  }

  // Dark > Light Flip

  const existingMainEl = document.querySelector('main');
  const flippedMainEl = document.createElement('main');
  let nextNode;

  while ((nextNode = supernovaScrollyteller.mountNode.nextSibling)) {
    flippedMainEl.appendChild(nextNode);
  }

  flippedMainEl.className = String(existingMainEl.className).replace('-invert', '');
  existingMainEl.parentElement.insertBefore(flippedMainEl, existingMainEl.nextSibling);
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

              const renditions = (doc.renditions || doc.media).slice().sort((a, b) => b.width - a.width);
              let src = renditions[0].url;

              renditions.slice(1).forEach(x => {
                if (x.width > window.innerWidth) {
                  src = x.url;
                }
              });

              resolve({
                id: doc.id,
                tagName,
                src
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
