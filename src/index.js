import capiFetch from '@abcnews/capi-fetch';
import { loadOdysseyScrollyteller } from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, render } from 'preact';
import SuperK from './components/SuperK';
import Supernova from './components/Supernova';
import styles from './styles.css';

const superk = {
  scrollyteller: null,
  assets: null,
  schedulerReference: null
};
const superk2 = {
  scrollyteller: null,
  assets: null,
  schedulerReference: null
};
const supernova = {
  scrollyteller: null
};

function renderSuperK() {
  if (superk.schedulerReference) {
    window.__ODYSSEY__.scheduler.unsubscribe(superk.schedulerReference);
  }

  render(
    <SuperK assets={superk.assets} panels={superk.scrollyteller.panels} />,
    superk.scrollyteller.mountNode,
    superk.scrollyteller.mountNode.firstChild
  );

  let mountNodeOpacity = null;

  superk.schedulerReference = client => {
    const box = superk.scrollyteller.mountNode.getBoundingClientRect();
    const nextMountNodeOpacity = Math.max(0, Math.min(box.bottom - client.height, client.height)) / client.height;

    if (mountNodeOpacity !== nextMountNodeOpacity) {
      mountNodeOpacity = nextMountNodeOpacity;
      superk.scrollyteller.mountNode.style.opacity = mountNodeOpacity;
    }
  };

  window.__ODYSSEY__.scheduler.subscribe(superk.schedulerReference);
}

function renderSuperK2() {
  if (superk2.schedulerReference) {
    window.__ODYSSEY__.scheduler.unsubscribe(superk2.schedulerReference);
  }

  render(
    <SuperK assets={superk2.assets} panels={superk2.scrollyteller.panels} />,
    superk2.scrollyteller.mountNode,
    superk2.scrollyteller.mountNode.firstChild
  );

  let mountNodeOpacity = null;

  superk2.schedulerReference = client => {
    const box = superk2.scrollyteller.mountNode.getBoundingClientRect();
    const nextMountNodeOpacity = Math.max(0, Math.min(box.bottom - client.height, client.height)) / client.height;

    if (mountNodeOpacity !== nextMountNodeOpacity) {
      mountNodeOpacity = nextMountNodeOpacity;
      superk2.scrollyteller.mountNode.style.opacity = mountNodeOpacity;
    }
  };

  window.__ODYSSEY__.scheduler.subscribe(superk2.schedulerReference);
}

function renderSupernova() {
  render(
    <Supernova panels={supernova.scrollyteller.panels} />,
    supernova.scrollyteller.mountNode,
    supernova.scrollyteller.mountNode.firstChild
  );
}

if (module.hot) {
  function renderErrorBox(err, instance) {
    import('./components/ErrorBox').then(exports => {
      const ErrorBox = exports.default;
      render(<ErrorBox error={err} />, instance.scrollyteller.mountNode, instance.scrollyteller.mountNode.firstChild);
    });
  }

  module.hot.accept('./components/SuperK', () => {
    if (superk.scrollyteller) {
      try {
        renderSuperK();
      } catch (err) {
        renderErrorBox(err, superk);
      }
    }

    if (superk2.scrollyteller) {
      try {
        renderSuperK2();
      } catch (err) {
        renderErrorBox(err, superk2);
      }
    }
  });
  module.hot.accept('./components/Supernova', () => {
    if (supernova.scrollyteller) {
      try {
        renderSupernova();
      } catch (err) {
        renderErrorBox(err, supernova);
      }
    }
  });
}

function init() {
  // SuperK

  try {
    superk.scrollyteller = loadOdysseyScrollyteller('superk', cn('u-full', styles.mountNode));
  } catch (e) {}

  if (superk.scrollyteller && superk.scrollyteller.mountNode) {
    while (superk.scrollyteller.mountNode.nextElementSibling.tagName === 'A') {
      window.__ODYSSEY__.utils.dom.detach(superk.scrollyteller.mountNode.nextElementSibling);
    }

    fetchAssets(superk.scrollyteller.panels)
      .then(_assets => {
        superk.assets = _assets;
        renderSuperK();
      })
      .catch(err => {
        console.error(err);
      });
  }

  // SuperK 2

  try {
    superk2.scrollyteller = loadOdysseyScrollyteller('superk2', cn('u-full', styles.mountNode));
  } catch (e) {}

  if (superk2.scrollyteller && superk2.scrollyteller.mountNode) {
    while (superk2.scrollyteller.mountNode.nextElementSibling.tagName === 'A') {
      window.__ODYSSEY__.utils.dom.detach(superk2.scrollyteller.mountNode.nextElementSibling);
    }

    fetchAssets(superk2.scrollyteller.panels)
      .then(_assets => {
        superk2.assets = _assets;
        renderSuperK2();
      })
      .catch(err => {
        console.error(err);
      });
  }

  // Supernova

  try {
    supernova.scrollyteller = loadOdysseyScrollyteller('supernova', cn('u-full', styles.mountNode));
  } catch (e) {}

  if (supernova.scrollyteller && supernova.scrollyteller.mountNode) {
    while (supernova.scrollyteller.mountNode.nextElementSibling.tagName === 'A') {
      window.__ODYSSEY__.utils.dom.detach(supernova.scrollyteller.mountNode.nextElementSibling);
    }

    renderSupernova();
  }

  // Dark > Light Flip

  const existingMainEl = document.querySelector('main');
  const flippedMainEl = document.createElement('main');
  let nextNode;

  while ((nextNode = supernova.scrollyteller.mountNode.nextSibling)) {
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
