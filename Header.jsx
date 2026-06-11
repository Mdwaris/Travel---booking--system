import { Link } from 'react-router-dom';

export default function Header({ adminToken, userToken, userProfile }) {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="logo">
          <h1>✈️ Luxury Travels</h1>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="/#destinations">Destinations</a></li>
          <li><a href="/#blog">Blog</a></li>
          <li><Link to="/contact">Contact</Link></li>
          <li>
            <Link to={userToken ? '/account' : '/login'}>
              {userToken ? userProfile?.name || 'Account' : 'Login'}
            </Link>
          </li>
          <li><Link to={adminToken ? '/admin' : '/admin/login'}>Admin</Link></li>
        </ul>
        <div className="hamburger" onClick={() => document.querySelector('.nav-links').classList.toggle('nav-open')}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
