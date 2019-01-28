import { h } from 'preact';
import styles from './styles.css';

const Neutrino = ({ step }) => (
  <div className={styles.root}>
    <div className="u-richtext-invert">
      <h2>{`Neutrino ${step} / 10`}</h2>
    </div>
  </div>
);

export default Neutrino;
