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

    this.onMarker = this.onMarker.bind(this);
  }

  onMarker(changes) {
    this.setState({ ...DEFAULT_STATE, ...changes });
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
