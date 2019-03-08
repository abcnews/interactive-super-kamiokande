import cn from 'classnames';
import { h } from 'preact';
import Neutrino from '../Neutrino';
import Tank from '../Tank';
import styles from './styles.css';

const Graphic = ({ assets, scene, elevation, yaw, pitch, roll, asset }) => (
  <Layers>
    <Layer isVisible={scene === 'neutrino'}>
      <Neutrino />
    </Layer>
    <Layer isVisible={scene === 'tank'}>
      <Tank assets={assets} elevation={elevation} yaw={yaw} pitch={pitch} roll={roll} asset={asset} />
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
