import { useMemo, useState } from 'react';
import DestinationCard from '../components/DestinationCard.jsx';
import { sendContactMessage } from '../lib/api.js';

export default function Home({ destinations, loading, error }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [contactFeedback, setContactFeedback] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const regions = useMemo(() => {
    const allRegions = destinations.map((destination) => destination.region);
    return ['All', ...Array.from(new Set(allRegions))];
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return destinations.filter(({ title, description, country, region }) => {
      const matchesSearch =
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        country.toLowerCase().includes(query) ||
        region.toLowerCase().includes(query);
      const matchesRegion = regionFilter === 'All' || region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, regionFilter, destinations]);

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('contactName');
    const email = formData.get('contactEmail');
    const message = formData.get('contactMessage');

    if (!name || !email || !message) {
      setContactFeedback('Please fill in all fields.');
      return;
    }

    try {
      setContactSubmitting(true);
      const response = await sendContactMessage({
        name,
        email,
        subject: 'Homepage enquiry',
        message,
      });
      setContactFeedback(response.message);
      event.target.reset();
    } catch (submitError) {
      setContactFeedback(submitError.message || 'Unable to send your message right now.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <>
      <header className="hero" id="home">
        <div className="hero-content">
          <h2>Discover Luxury Travel Destinations</h2>
          <p>Explore the world's most exquisite travel experiences</p>
          <div className="hero-search">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="search"
              placeholder="Search destinations around the world..."
              aria-label="Search destinations"
            />
          </div>
          <button className="cta-button" onClick={() => document.querySelector('#destinations')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Now
          </button>
        </div>
      </header>

      <main>
        <section className="featured-destinations" id="destinations">
          <div className="container">
            <h2>Featured Luxury Destinations</h2>
            <div className="destination-filters">
              <div className="destination-region">
                <label htmlFor="regionFilter">Region:</label>
                <select
                  id="regionFilter"
                  value={regionFilter}
                  onChange={(event) => setRegionFilter(event.target.value)}
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="destination-count">Showing {filteredDestinations.length} destinations</p>
            <div className="destination-grid">
              {loading && <p className="section-message">Loading destinations...</p>}
              {!loading && error && <p className="section-message error-message">{error}</p>}
              {!loading && !error && filteredDestinations.length === 0 && (
                <p className="section-message">No destinations matched your search.</p>
              )}
              {filteredDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        </section>

        <section className="map-section">
          <div className="container">
            <h2>Plan Your Route</h2>
            <div className="map-card">
              <iframe
                title="Destination map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.01952319787!2d144.96305831568574!3d-37.81720997975169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d43f1b7b0d3%3A0xc6b29c5b2d2e0cf1!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <div className="container">
            <h2>What Our Clients Say</h2>
            <div className="testimonial-grid">
              <div className="testimonial-card">
                <p>"An unforgettable luxury experience in Paris. The private Louvre tour was incredible!"</p>
                <h4>- Sarah Johnson, New York</h4>
              </div>
              <div className="testimonial-card">
                <p>"Bali villa was pure paradise. The concierge service exceeded all expectations."</p>
                <h4>- Michael Chen, London</h4>
              </div>
              <div className="testimonial-card">
                <p>"Tokyo's neon lights and Michelin dining made for a perfect blend of culture and luxury."</p>
                <h4>- Emma Rodriguez, Madrid</h4>
              </div>
            </div>
          </div>
        </section>

        <section className="blog-preview" id="blog">
          <div className="container">
            <h2>Latest Travel Articles</h2>
            <div className="blog-grid">
              <article className="blog-card">
                <h3>Top 10 Luxury Resorts in 2026</h3>
                <p>Discover the world’s most exclusive and luxurious resort destinations...</p>
                <a href="#">Read More →</a>
              </article>
              <article className="blog-card">
                <h3>Hidden Gems for Premium Travelers</h3>
                <p>Explore exclusive, lesser-known destinations perfect for luxury getaways...</p>
                <a href="#">Read More →</a>
              </article>
              <article className="blog-card">
                <h3>Travel Tips for the Discerning Adventurer</h3>
                <p>Expert advice on making the most of your luxury travel experience...</p>
                <a href="#">Read More →</a>
              </article>
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="container">
            <h2>Get In Touch</h2>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <input type="text" name="contactName" placeholder="Your Name" required />
              <input type="email" name="contactEmail" placeholder="Your Email" required />
              <textarea name="contactMessage" placeholder="Your Message" rows="5" required></textarea>
              <button type="submit" className="submit-btn" disabled={contactSubmitting}>
                {contactSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {contactFeedback && <p className="feedback-message">{contactFeedback}</p>}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
