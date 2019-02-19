import Scrollyteller from '@abcnews/scrollyteller';
import cn from 'classnames';
import { h, Component } from 'preact';
import Graphic from '../Graphic';
import styles from './styles.css';

const DEFAULT_STATE = {
  step: 1
};

export default class App extends Component {
  state = DEFAULT_STATE;

  constructor(props) {
    super(props);

    this.cumulatitveStateMap = createCumulatitveStateMap(props.panels.map(panel => panel.config), DEFAULT_STATE);

    this.onMarker = this.onMarker.bind(this);
  }

  onMarker(changes) {
    console.log(changes, this.cumulatitveStateMap.get(changes));
    this.setState(this.cumulatitveStateMap.get(changes));
  }

  render() {
    const { panels } = this.props;

    return (
      <Scrollyteller
        className={cn('is-piecemeal', styles.scrollyteller)}
        onMarker={this.onMarker}
        panels={panels}
        panelClassName={cn('Block-content', 'u-richtext-invert', styles.center)}
      >
        <Graphic {...this.state} />
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
    map.set(state, { ...tempState });
  });

  return map;
}
