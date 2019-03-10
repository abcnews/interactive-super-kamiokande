import { Entity } from 'aframe-react';
import { h, Component } from 'preact';
import createRef from 'react-create-ref';

export default class Sky extends Component {
  constructor(props) {
    super(props);

    this.root = createRef();
  }

  componentDidMount() {
    // For some reason, iniital attributes aren't set. Do it manually.
    this.root.current.setAttribute('opacity', this.props.isActive ? 1 : 0);

    if (this.props.tagName === 'video') {
      const assetReadyInterval = setInterval(() => {
        if (
          this.root.current.components.material.material &&
          this.root.current.components.material.material.map &&
          this.root.current.components.material.material.map.image &&
          this.root.current.components.material.material.map.image.play
        ) {
          clearInterval(assetReadyInterval);
          this.root.current.components.material.material.map.image.play();
        }
      }, 250);
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.root.current) {
      return;
    }

    if (this.props.tagName === 'video' && this.props.isActive && !prevProps.isActive) {
      this.root.current.components.material.material.map.image.currentTime = 0;
    }
  }

  render() {
    const { tagName, src, radius, isActive } = this.props;

    const end = {
      opacity: isActive ? 1 : 0
    };

    const begin = {
      opacity: this.root.current ? +this.root.current.getAttribute('opacity') : isActive ? 0 : 1
    };

    return (
      <Entity
        _ref={this.root}
        primitive={tagName === 'video' ? 'a-videosphere' : 'a-sky'}
        material={{ opacity: end.opacity }}
        // opacity={end.opacity}
        animation_fade={fadeAnimation(begin.opacity, end.opacity)}
        src={src}
        radius={radius}
      />
    );
  }
}

const fadeAnimation = (from, to) =>
  [
    `property: opacity`,
    // `property: components.material.material.opacity`,
    // `isRawProperty: true`,
    `dur: 2000`,
    `from: ${from}`,
    `to: ${to}`,
    `easing: linear`,
    `loop: 1`
  ].join('; ');
