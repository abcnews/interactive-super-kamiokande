import { Entity } from 'aframe-react';
import { h, Component } from 'preact';
import createRef from 'react-create-ref';

export default class Camera extends Component {
  constructor(props) {
    super(props);

    this.yawAxis = createRef();
    this.pitchAxis = createRef();
    this.rollAxis = createRef();
  }

  render() {
    const { yaw, pitch, roll, children } = this.props;
    const end = {
      yaw: (yaw || 0) % 360,
      pitch: clamp(pitch, 75),
      roll: clamp(roll, 60)
    };
    const begin = {
      yaw: this.yawAxis.current ? (this.yawAxis.current.getAttribute('rotation').y + 360) % 360 : end.yaw,
      pitch: this.pitchAxis.current ? (this.pitchAxis.current.getAttribute('rotation').x + 360) % 360 : end.pitch,
      roll: this.rollAxis.current ? (this.rollAxis.current.getAttribute('rotation').z + 360) % 360 : end.roll
    };
    const yawPath = shortestPath(begin.yaw, end.yaw);
    const pitchPath = shortestPath(begin.pitch, end.pitch);
    const rollPath = shortestPath(begin.roll, end.roll);
    const animationDuration = Math.max((Math.max(yawPath.diff, pitchPath.diff, rollPath.diff) / 180) * 2000, 2000);
    const yawAnimation = rotationAnimation('y', yawPath, animationDuration);
    const pitchAnimation = rotationAnimation('x', pitchPath, animationDuration);
    const rollAnimation = rotationAnimation('z', rollPath, animationDuration);

    return (
      <Entity _ref={this.yawAxis} animation__yaw={yawAnimation}>
        <Entity _ref={this.pitchAxis} animation__pitch={pitchAnimation}>
          <Entity
            _ref={this.rollAxis}
            primitive="a-camera"
            position="0 0 0"
            animation__roll={rollAnimation}
            look-controls-enabled="false"
            wasd-controls-enabled="false"
          >
            {children}
          </Entity>
        </Entity>
      </Entity>
    );
  }
}

const clamp = (angle, limit) => {
  angle = (angle || 0) % 360;

  if (angle > 180) {
    angle -= 360;
  }

  return Math.max(-limit, Math.min(limit, angle));
};

const shortestPath = (from, to) => {
  const diff = Math.abs(((to - from + 540) % 360) - 180);
  if (diff < Math.abs(to - from)) {
    return { from: from > to ? from - 360 : from, to: to > from ? to - 360 : to, diff };
  }

  return { from, to, diff };
};

// const rotationAnimation = (axis, path, duration) => ({
//   property: 'rotation',
//   dur: duration,
//   from: { [axis]: path.from },
//   to: { [axis]: path.to },
//   easing: 'easeInOutQuad',
//   loop: 1
// });

const rotationAnimation = (axis, path, duration) =>
  [
    `property: rotation`,
    `dur: ${duration}`,
    `from: ${axis === 'x' ? path.from : 0} ${axis === 'y' ? path.from : 0} ${axis === 'z' ? path.from : 0}`,
    `to: ${axis === 'x' ? path.to : 0} ${axis === 'y' ? path.to : 0} ${axis === 'z' ? path.to : 0}`,
    `easing: easeInOutQuad`,
    `loop: 1`
  ].join('; ');
