import { Entity, Scene } from 'aframe-react';
import { h, Component } from 'preact';
import Camera from '../Camera';
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
    this.getActiveLayerRef = this.getActiveLayerRef.bind(this);

    import(/* webpackChunkName: "tank-dependencies" */ './dependencies')
      .then(() => {
        this.setState({ loadedDependencies: true });
      })
      .catch(err => console.error(err));
  }

  getActiveLayerRef(component) {
    if (!component) {
      return;
    }

    const layerEl = component.el;

    const isVideo =
      layerEl.components.material.material &&
      layerEl.components.material.material.map &&
      layerEl.components.material.material.map.image &&
      layerEl.components.material.material.map.image.play;

    if (isVideo) {
      // layerEl.components.material.material.map.image.currentTime = 0;
      layerEl.components.material.material.map.image.play();
    }
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
            <Entity
              animation_fade={fadeAnimation(asset === id ? 0 : 1, asset === id ? 1 : 0)}
              material={{ opacity: asset === id ? 1 : 0 }}
              primitive={tagName === 'video' ? 'a-videosphere' : 'a-sky'}
              ref={asset === id ? this.getActiveLayerRef : null}
              src={`#sky-${this.id}-${id}`}
            />
          ))}
        </Entity>
        <Camera yaw={+yaw} pitch={+pitch} roll={+roll} />
        <Camera elevation={+elevation} maxElevation={RADIUS} yaw={+yaw} pitch={+pitch} roll={+roll} />
      </Scene>
    ) : (
      <div className={styles.loading} />
    );
  }
}

const fadeAnimation = (from, to) =>
  [
    `property: components.material.material.opacity`,
    `dur: 1000`,
    `from: ${from}`,
    `to: ${to}`,
    `easing: easeInOutQuad`,
    `loop: 1`
  ].join('; ');
