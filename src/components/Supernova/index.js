import Scrollyteller from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, Component } from 'preact';
import { createRef } from '../../utils';
import styles from './styles.css';

const MAX_FAILED_ATTEMPTS = 5;

export default class Supernova extends Component {
  constructor(props) {
    super(props);

    this.isIframeReady = false;

    this.iframe = createRef();

    this.onMarker = this.onMarker.bind(this);
    this.postMessage = this.postMessage.bind(this);
  }

  postMessage(message, failedAttempts = 0) {
    if ((!this.iframe.current || !this.isFrameReady) && failedAttempts < MAX_FAILED_ATTEMPTS) {
      return setTimeout(() => {
        this.postMessage(message, failedAttempts + 1);
      }, 250);
    }

    this.iframe.current.contentWindow.postMessage(message, '*');
  }

  onMarker(config) {
    const { exploded, reset, slide } = config;

    if (!this.iframe.current) {
      return;
    }

    // Toggle dark mode
    document.documentElement.classList[exploded ? 'remove' : 'add']('is-dark-mode');

    if (slide) {
      this.postMessage({ type: 'slide', data: slide });
    } else if (reset) {
      this.postMessage({ type: 'reset' });
    }
  }

  render() {
    const { assets, panels } = this.props;

    return (
      <Scrollyteller
        className={cn('is-piecemeal', styles.scrollyteller)}
        onMarker={this.onMarker}
        panels={panels}
        panelClassName={cn('Block-content', 'u-richtext-invert', styles.panel)}
      >
        <iframe
          ref={this.iframe}
          className={styles.frame}
          frameborder="0"
          scrolling="no"
          onLoad={() => (this.isFrameReady = true)}
          src={`${__webpack_public_path__}Supernova.svg`}
        />
      </Scrollyteller>
    );
  }
}
