import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userInitial = 'S' }) => {
  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar__brand">
        <div className="navbar__logo-icon">⚡</div>
        <span className="navbar__brand-name">GenAI Stack</span>
      </Link>

      {/* User Avatar */}
      <div className="navbar__avatar" title="Profile">
        {userInitial}
      </div>
    </nav>
  );
};

export default Navbar;