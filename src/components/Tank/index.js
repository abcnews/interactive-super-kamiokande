import { Entity, Scene } from 'aframe-react';
import { h, Component } from 'preact';
import Camera from '../Camera';
import styles from './styles.css';

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

    return loadedDependencies ? (
      <Scene embedded keyboard-shortcuts="enterVR: false" vr-mode-ui="enabled: false">
        <a-assets>
          <img id="sky-source" crossOrigin="anonymous" src={`${__webpack_public_path__}assets/360-test.jpg`} />
        </a-assets>
        <Entity primitive="a-sky" radius={10000} src="#sky-source" rotation="0 60 0" />
        <Camera yaw={step < 11 ? 0 : (step - 11) * 15} pitch={step < 11 ? 45 : 30} roll={0} />
      </Scene>
    ) : (
      // <a-scene embedded="true" keyboard-shortcuts="enterVR: false" vr-mode-ui="enabled: false">
      //   <a-assets>
      //     <img id="sky-source" crossOrigin="anonymous" src={`${__webpack_public_path__}assets/360-test.jpg`} />
      //   </a-assets>
      //   <a-sky radius={10000} src="#sky-source" rotation="0 60 0" />
      //   <Camera yaw={step < 11 ? 0 : (step - 11) * 5} pitch={step < 11 ? 45 : 15} roll={0} />
      // </a-scene>
      <div className={styles.loading} />
    );
  }
}
