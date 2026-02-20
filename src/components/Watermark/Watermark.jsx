import './Watermark.css';
import logo from '../../assets/sri-murugan-logo.png';

const Watermark = () => {
  return (
    <div
      className="watermark"
      style={{ '--watermark-image': `url(${logo})` }}
      aria-hidden="true"
    />
  );
};

export default Watermark;
