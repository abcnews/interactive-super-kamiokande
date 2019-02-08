import { Entity, Scene } from 'aframe-react';
import { h, Component } from 'preact';
import Camera from '../Camera';
import styles from './styles.css';

const LAYERS = [
  {
    tagName: 'img',
    src: '360-take2-4000-60percent.jpg'
  },
  {
    tagName: 'video',
    loop: false,
    src: 'Tank_visualisation-example.mp4'
  }
];

const PRESET_STEPS = [
  {
    layerIndex: 0,
    yaw: 0,
    pitch: 45
  },
  {
    layerIndex: 0,
    yaw: 0,
    pitch: 15
  },
  {
    layerIndex: 0,
    yaw: 90,
    pitch: 15
  },
  {
    layerIndex: 1,
    yaw: 90,
    pitch: 15
  },
  {
    layerIndex: 0,
    yaw: 0,
    pitch: 15
  }
];

const SKIES_OFFSET_ROTATION = '0 78 0';

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
    const layerEl = component.el;

    const isVideo = layerEl.components.material.material && layerEl.components.material.material.map.image.play;

    if (isVideo) {
      // layerEl.components.material.material.map.image.currentTime = 0;
      layerEl.components.material.material.map.image.play();
    }
  }

  shouldComponentUpdate({ step }, { loadedDependencies }) {
    return step !== this.props.step || loadedDependencies !== this.state.loadedDependencies;
  }

  render() {
    const { step } = this.props;
    const { loadedDependencies } = this.state;
    const { layerIndex, yaw, pitch } = PRESET_STEPS[step] || PRESET_STEPS[0];

    return loadedDependencies ? (
      <Scene embedded keyboard-shortcuts="enterVR: false" vr-mode-ui="enabled: false">
        <a-assets>
          {LAYERS.map(({ tagName, loop, src }, index) =>
            h(tagName, {
              autoPlay: tagName === 'video',
              crossOrigin: 'anonymous',
              id: `sky-${this.id}-${index}`,
              loop: loop,
              muted: tagName === 'video',
              src: `${__webpack_public_path__}assets/${src}`
            })
          )}
        </a-assets>
        <Entity rotation={SKIES_OFFSET_ROTATION}>
          {LAYERS.map(({ tagName }, index) => (
            <Entity
              animation_fade={fadeAnimation(index === layerIndex ? 0 : 1, index === layerIndex ? 1 : 0)}
              material={{ opacity: index === layerIndex ? 1 : 0 }}
              primitive={tagName === 'video' ? 'a-videosphere' : 'a-sky'}
              ref={index === layerIndex ? this.getActiveLayerRef : null}
              src={`#sky-${this.id}-${index}`}
            />
          ))}
        </Entity>
        <Camera yaw={yaw} pitch={pitch} roll={0} />
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
