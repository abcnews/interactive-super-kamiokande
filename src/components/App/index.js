import Scrollyteller from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, Component } from 'preact';
import Graphic from '../Graphic';
import styles from './styles.css';

const DEFAULT_STATE = {
  scene: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  asset: null
};

export default class App extends Component {
  state = DEFAULT_STATE;

  constructor(props) {
    super(props);

    this.configToStateMap = createCumulatitveStateMap(props.panels.map(panel => panel.config), DEFAULT_STATE);

    this.onMarker = this.onMarker.bind(this);
  }

  onMarker(config) {
    this.setState(this.configToStateMap.get(config));
  }

  render() {
    const { assets, panels } = this.props;
    console.log(this.state);

    return (
      <Scrollyteller
        className={cn('is-piecemeal', styles.scrollyteller)}
        onMarker={this.onMarker}
        panels={panels}
        panelClassName={cn('Block-content', 'u-richtext-invert', styles.center)}
      >
        <Graphic assets={assets} {...this.state} />
      </Scrollyteller>
    );
  }
}

function createCumulatitveStateMap(states, initialState) {
  const map = new WeakMap();
  let tempState = { ...initialState };

  states.forEach(state => {
    tempState = { ...tempState, ...state };
    delete tempState.hash;
    delete tempState.piecemeal;
    map.set(state, { ...tempState });
  });

  return map;
}
