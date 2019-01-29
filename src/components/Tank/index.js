import { Entity, Scene } from 'aframe-react';
import { h, Component } from 'preact';
import Camera from '../Camera';
import styles from './styles.css';

const PRESET_YAWS = [0, 0, 15, 345, 30, 330];

export default class Tank extends Component {
  state = {
    loadedDependencies: false
  };

  constructor(props) {
    super(props);

    import(/* webpackChunkName: "tank-dependencies" */ './dependencies')
      .then(() => {
        this.setState({ loadedDependencies: true });
      })
      .catch(err => console.error(err));
  }

  shouldComponentUpdate({ step }, { loadedDependencies }) {
    return step !== this.props.step || loadedDependencies !== this.state.loadedDependencies;
  }

  render() {
    const { step } = this.props;
    const { loadedDependencies } = this.state;

    const yaw = PRESET_YAWS[step];
    const pitch = step === 0 ? 45 : 15;

    return loadedDependencies ? (
      <Scene embedded keyboard-shortcuts="enterVR: false" vr-mode-ui="enabled: false">
        <a-assets>
          <img
            id="sky-source"
            crossOrigin="anonymous"
            src={`${__webpack_public_path__}assets/360-take2-4000-60percent.jpg`}
          />
        </a-assets>
        <Entity primitive="a-sky" radius={10000} src="#sky-source" rotation="0 78 0" />
        {/* <Camera position="0 2000 1000" yaw={yaw} pitch={pitch} roll={0} /> */}
        <Camera yaw={yaw} pitch={pitch} roll={0} />
      </Scene>
    ) : (
      <div className={styles.loading} />
    );
  }
}
