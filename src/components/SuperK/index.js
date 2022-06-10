import Scrollyteller from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, Component } from 'preact';
import Graphic from '../Graphic';
import styles from './styles.css';

const DEFAULT_STATE = {
  scene: 0,
  elevation: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  asset: null
};

export default class SuperK extends Component {
  state = DEFAULT_STATE;

  constructor(props) {
    super(props);

    props.panels.forEach((panel, index) => (panel.data._index = index));

    this.indexedStates = createCumulatitveStateIndex(props.panels, DEFAULT_STATE);

    this.onMarker = this.onMarker.bind(this);
  }

  onMarker(data) {
    this.setState(this.indexedStates[data._index]);
  }

  render() {
    const { assets, panels } = this.props;

    return (
      <Scrollyteller
        className={cn('is-piecemeal', styles.scrollyteller, `scene__${this.state.scene}`)}
        onMarker={this.onMarker}
        panels={panels}
        panelClassName={cn('Block-content', 'u-richtext-invert', styles.panel)}
      >
        <Graphic assets={assets} {...this.state} />
      </Scrollyteller>
    );
  }
}

const negativeNumberPattern = /^n\d+/;
const decimalNumberPattern = /\d+p\d+$/;

function createCumulatitveStateIndex(panels, initialState) {
  let temp = { ...initialState };

  return panels.map(({ data }) => {
    temp = { ...temp, ...data };

    // Number resolution
    Object.keys(temp).forEach(key => {
      if (negativeNumberPattern.test(String(temp[key]))) {
        temp[key] = temp[key].replace('n', '-');
      }

      if (decimalNumberPattern.test(String(temp[key]))) {
        temp[key] = temp[key].replace('p', '.');
      }

      if (temp[key] == +temp[key]) {
        temp[key] = +temp[key];
      }
    });

    const { hash, piecemeal, _index, ...state } = temp;

    return state;
  });
}
