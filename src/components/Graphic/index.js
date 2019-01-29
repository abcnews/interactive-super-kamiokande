import cn from 'classnames';
import { h } from 'preact';
import Neutrino from '../Neutrino';
import Tank from '../Tank';
import styles from './styles.css';

const Graphic = ({ step }) => (
  <Layers>
    <Layer isVisible={step < 10}>
      <Neutrino step={clamp(step, 0, 9)} />
    </Layer>
    <Layer isVisible={step >= 15 && step < 18}>
      <div className="u-richtext-invert">
        <h2>🎇</h2>
      </div>
    </Layer>
    <Layer isVisible={step > 10}>
      <Tank step={clamp(step - 10, 0, 5)} />
    </Layer>
  </Layers>
);

export default Graphic;

const Layers = ({ children, className, ...otherProps }) => (
  <div className={cn(styles.layers, className)} {...otherProps}>
    {children.slice().reverse()}
  </div>
);

const Layer = ({ children, className, isVisible, ...otherProps }) => (
  <div
    className={cn(styles.layer, className)}
    style={{ opacity: isVisible ? 0.99 : 0, pointerEvents: isVisible ? 'initial' : 'none' }}
    {...otherProps}
  >
    {children}
  </div>
);

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
