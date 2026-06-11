import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="notfound">
      <div className="container">
        <h2>Page not found</h2>
        <p>Sorry, that page doesn't exist. Let's get you back home.</p>
        <Link className="submit-btn" to="/">Return Home</Link>
      </div>
    </main>
  );
}
