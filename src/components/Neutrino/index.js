import { h } from 'preact';
import styles from './styles.css';

const Neutrino = () => (
  <div className={styles.root}>
    <object className={styles.neutrino} data={`${__webpack_public_path__}Neutrino.svg`} />
  </div>
);

export default Neutrino;
