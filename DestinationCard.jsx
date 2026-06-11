import { Link } from 'react-router-dom';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400?text=Luxury+Destination';

export default function DestinationCard({ destination }) {
  return (
    <article className="destination-card">
      <img
        src={destination.image}
        alt={destination.title}
        loading="lazy"
        onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
      />
      <h3>{destination.title}</h3>
      <p>{destination.description}</p>
      <span className="price">{destination.price}</span>
      <Link className="book-btn" to={`/destinations/${destination.id}`}>View Details</Link>
    </article>
  );
}
