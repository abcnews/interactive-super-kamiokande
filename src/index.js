import { loadOdysseyScrollyteller } from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, render } from 'preact';
import App from './components/App';
import styles from './styles.css';

let scrollyteller;

function renderApp() {
  render(<App panels={scrollyteller.panels} />, scrollyteller.mountNode, scrollyteller.mountNode.firstChild);
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
  renderApp();
  // window.scrollY = 0;
}

if (window.__ODYSSEY__) {
  init();
} else {
  window.addEventListener('odyssey:api', init);
}

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
}
