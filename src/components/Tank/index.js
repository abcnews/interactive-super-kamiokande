import { Entity, Scene } from 'aframe-react';
import { h, Component } from 'preact';
import Camera from '../Camera';
import Sky from '../Sky';
import styles from './styles.css';

const RADIUS = 20;
const SKIES_OFFSET_ROTATION = '0 85 0';

let nextID = 0;

export default class Tank extends Component {
  state = {
    loadedDependencies: false
  };

  constructor(props) {
    super(props);

    this.id = nextID++;

    import(/* webpackChunkName: "tank-dependencies" */ './dependencies')
      .then(() => {
        this.setState({ loadedDependencies: true });
      })
      .catch(err => console.error(err));
  }

  shouldComponentUpdate({ scene, elevation, yaw, pitch, roll, asset }, { loadedDependencies }) {
    return (
      scene !== this.props.scene ||
      elevation !== this.props.elevation ||
      yaw !== this.props.yaw ||
      pitch !== this.props.pitch ||
      roll !== this.props.roll ||
      asset !== this.props.asset ||
      loadedDependencies !== this.state.loadedDependencies
    );
  }

  render() {
    const { assets, scene, elevation, yaw, pitch, roll, asset } = this.props;
    const { loadedDependencies } = this.state;

    return loadedDependencies ? (
      <Scene embedded keyboard-shortcuts="enterVR: false" vr-mode-ui="enabled: false">
        <a-assets>
          {assets.map(({ id, tagName, src }) =>
            h(tagName, {
              autoPlay: tagName === 'video',
              crossOrigin: 'anonymous',
              id: `sky-${this.id}-${id}`,
              loop: tagName === 'video',
              muted: tagName === 'video',
              src
            })
          )}
        </a-assets>
        <Entity rotation={SKIES_OFFSET_ROTATION}>
          {assets.map(({ id, tagName }, index) => (
            <Sky tagName={tagName} src={`#sky-${this.id}-${id}`} radius={RADIUS} isActive={asset === id} />
          ))}
        </Entity>
        <Camera elevation={+elevation} maxElevation={RADIUS} yaw={+yaw} pitch={+pitch} roll={+roll} />
      </Scene>
    ) : (
      <div className={styles.loading} />
    );
  }
}
