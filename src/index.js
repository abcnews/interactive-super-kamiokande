import './polyfills';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { isMount, selectMounts } from '@abcnews/mount-utils';
import { loadScrollyteller } from '@abcnews/scrollyteller';
import terminusFetch from '@abcnews/terminus-fetch';
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

whenOdysseyLoaded.then(() => {
  const dom = window.__ODYSSEY__.utils.dom;
  const { subscribe } = window.__ODYSSEY__.scheduler;

  // Meta (byline/infosource/dates)

  const delayedTitle = dom.select('.Main h2');

  if (delayedTitle) {
    const metaContent = dom.select('.Header-content');

    dom.detach(dom.select('h1', metaContent));
    dom.after(delayedTitle, metaContent);
    dom.after(metaContent, document.createElement('hr'));
  }

  // Bigger text markers

  selectMounts('bigger').forEach(el => {
    el.nextElementSibling.classList.add(styles.bigger);
    dom.detach(el);
  });

  // Bulb

  const [bulbMarker] = selectMounts('bulb');

  if (bulbMarker) {
    const bulbContainer = document.createElement('p');
    const bulbGraphic = document.createElement('object');

    bulbGraphic.setAttribute('data', `${__webpack_public_path__}Bulb.svg`);
    bulbGraphic.setAttribute('style', 'margin:0 auto !important;width:400px');
    bulbContainer.appendChild(bulbGraphic);
    dom.before(bulbMarker, bulbContainer);
    dom.detach(bulbMarker);
  }

  // SuperK

  try {
    superkScrollyteller = loadScrollyteller('superk', 'u-full');
  } catch (e) {}

  if (superkScrollyteller && superkScrollyteller.mountNode) {
    superkScrollyteller.mountNode.classList.add(styles.mountNode);

    while (isMount(superkScrollyteller.mountNode.nextElementSibling)) {
      dom.detach(superkScrollyteller.mountNode.nextElementSibling);
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
    supernovaScrollyteller = loadScrollyteller('supernova', 'u-full');
  } catch (e) {}

  if (supernovaScrollyteller && supernovaScrollyteller.mountNode) {
    supernovaScrollyteller.mountNode.classList.add(styles.mountNode);

    while (isMount(supernovaScrollyteller.mountNode.nextElementSibling)) {
      dom.detach(supernovaScrollyteller.mountNode.nextElementSibling);
    }

    renderSupernova();
  }

  // Dark > Light > Dark Flip

  const existingMainEl = dom.select('main');
  const flippedMainEl = document.createElement('main');
  const revertedMainEl = document.createElement('main');
  let targetMainEl = flippedMainEl;
  let nextNode;

  while ((nextNode = supernovaScrollyteller.mountNode.nextElementSibling)) {
    if (String(nextNode.className).indexOf('Block') > -1 && targetMainEl === flippedMainEl) {
      targetMainEl = revertedMainEl;
    }

    targetMainEl.appendChild(nextNode);
  }

  flippedMainEl.className = String(existingMainEl.className).replace('-invert', '');
  revertedMainEl.className = String(existingMainEl.className);
  dom.after(existingMainEl, flippedMainEl);
  dom.after(flippedMainEl, revertedMainEl);

  const firstRevertedBlockPar = dom.select('p', revertedMainEl);
  let lastSign;

  subscribe(client => {
    const { top } = firstRevertedBlockPar.getBoundingClientRect();

    if (Math.abs(top) > client.height / 2) {
      // We only want this toggling dark mode when you scroll past
      // the threshold, not when you start reading the story.
      return;
    }

    const currentSign = Math.sign(top);

    if (currentSign && currentSign !== lastSign) {
      document.documentElement.classList[currentSign > 0 ? 'remove' : 'add']('is-dark-mode');
      lastSign = currentSign;
    }
  });

  // A quick hack to add a Scroll down with the array
  const scrollHintElement = document.querySelector('.ScrollHint');

  var scrollDown = document.createElement('div');
  scrollDown.style.textAlign = 'center';
  scrollDown.style.fontFamily = 'ABCSans, Helvetica, Arial, sans-serif';
  scrollDown.style.fontSize = '11px';
  scrollDown.innerHTML = '<span style="color:#f9f9f9; position:relative; top:-18px;">Scroll down</span>';

  scrollHintElement.appendChild(scrollDown);
});

const ASSET_TAGNAMES = {
  Image: 'img',
  Video: 'video'
};

function fetchAssets(panels) {
  return new Promise((resolve, reject) => {
    const assetCMIDs = panels.reduce((memo, panel) => {
      const assetCMID = panel.data.asset;

      if (assetCMID && memo.indexOf(assetCMID) === -1) {
        memo.push(assetCMID);
      }

      return memo;
    }, []);

    Promise.all(
      assetCMIDs.map(
        assetCMID =>
          new Promise((resolve, reject) => {
            terminusFetch(assetCMID, (err, doc) => {
              if (err) {
                return reject(err);
              }

              const tagName = ASSET_TAGNAMES[doc.docType];

              if (!tagName) {
                return reject(new Error(`Unsupported asset type: ${doc.docType}`));
              }

              const renditions = (
                doc.docType === 'Video' ? doc.media.video.renditions.files : doc.media.image.primary.complete
              )
                .slice()
                .sort((a, b) => b.width - a.width);
              let src = renditions[0].url;

              renditions.slice(1).forEach(x => {
                if (x.width > window.innerWidth) {
                  src = x.url;
                }
              });

              resolve({
                id: +doc.id,
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
