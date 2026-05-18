import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";

const NAV_LINKS = ["Home", "About", "Events", "Gallery", "Contact"];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <div className="nav-logo">
          <span className="logo-text">Ayarewadi</span>
        </div>
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {NAV_LINKS.map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                {l}
              </a>
            </li>
          ))}
        </ul>
        <a href="#contact" className="nav-cta">Visit Us</a>
        <button
          className="hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-sub">Discover the</p>
        <h1 className="hero-title">Village of<br />Ayarewadi</h1>
        <p className="hero-desc">
          Culture · Nature · Community
        </p>
        <div className="hero-btns">
          <a href="#events" className="btn-primary">Explore Events</a>
          <a href="#about" className="btn-ghost">Know More</a>
        </div>
      </div>
      <div className="hero-scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section" id="about">
      <div className="container about-grid">
        <div className="about-image-wrap">
          <div className="about-img-placeholder">
            <div className="img-label">Village Life</div>
          </div>
        </div>
        <div className="about-text">
          <p className="section-sub">About the Village</p>
          <h2 className="section-title">Be close to nature,<br />feel the connection.</h2>
          <p className="section-body">
            Ayarewadi is a peaceful village nestled in Maharashtra, where tradition
            meets natural beauty. Experience authentic village life, local festivals,
            and the warmth of our community. Our roots are deep, our culture rich,
            and our doors are always open.
          </p>
          <a href="#events" className="btn-primary">Know More</a>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }) {
  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  return (
    <div className="event-card">
      <div className="event-card-img">
        <div className="event-img-placeholder" />
      </div>
      <div className="event-card-body">
        {dateStr && <span className="event-date">{dateStr}</span>}
        <h3 className="event-title">{event.title}</h3>
        <p className="event-desc">{event.description}</p>
        <a href="#contact" className="event-link">Learn More →</a>
      </div>
    </div>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://ayarewadi-project.onrender.com/events")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fallback = [
    { id: 1, title: "Ganesh Utsav", description: "The grand festival celebrating Lord Ganesha with music, dance and community feast.", date: "2024-09-07" },
    { id: 2, title: "Holi Celebrations", description: "Join us for a colourful celebration of Holi with traditional sweets and bonfire.", date: "2024-03-25" },
    { id: 3, title: "Village Fair (Jatra)", description: "Annual village fair with local artisans, cultural programs and traditional food stalls.", date: "2024-01-15" },
  ];

  const displayEvents = events.length > 0 ? events : fallback;

  return (
    <section className="events-section" id="events">
      <div className="events-bg-text">EVENTS</div>
      <div className="container">
        <p className="section-sub center">What's Happening</p>
        <h2 className="section-title center">Village Events &<br />Festivals</h2>
        {loading ? (
          <p className="loading-text">Loading events...</p>
        ) : (
          <div className="events-grid">
            {displayEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "500+", label: "Families" },
    { value: "12+", label: "Annual Festivals" },
    { value: "100+", label: "Years of History" },
    { value: "1", label: "Unique Village" },
  ];
  return (
    <section className="stats-section">
      <div className="container stats-grid">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Experience() {
  const items = [
    { icon: "🌾", title: "Village Farming", desc: "Experience traditional farming and seasonal harvests." },
    { icon: "🎭", title: "Cultural Programs", desc: "Folk dances, local theatre and traditional music." },
    { icon: "🍲", title: "Local Cuisine", desc: "Taste authentic Maharashtrian village food." },
    { icon: "🏞️", title: "Nature Walks", desc: "Explore surrounding fields, rivers and open skies." },
    { icon: "🏛️", title: "Heritage Sites", desc: "Visit historic temples and traditional structures." },
    { icon: "🤝", title: "Community Life", desc: "Meet locals and participate in daily village life." },
  ];
  return (
    <section className="experience-section" id="gallery">
      <div className="container">
        <p className="section-sub center">What to Experience</p>
        <h2 className="section-title center">We Offer the Best<br />of Village Life</h2>
        <div className="exp-grid">
          {items.map((item) => (
            <div className="exp-card" key={item.title}>
              <div className="exp-icon">{item.icon}</div>
              <h4 className="exp-title">{item.title}</h4>
              <p className="exp-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  const quotes = [
    { text: "Visiting Ayarewadi was a soul-refreshing experience. The warmth of the villagers and the simplicity of life left a lasting impression on my heart.", name: "Priya Kulkarni", place: "Pune" },
    { text: "The festivals here are vibrant and authentic. I felt truly connected to Maharashtra's cultural roots during my stay.", name: "Rahul Desai", place: "Mumbai" },
    { text: "A hidden gem. Peaceful, beautiful and full of life. I will definitely return to Ayarewadi.", name: "Sneha Patil", place: "Kolhapur" },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((v) => (v + 1) % quotes.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="testimonial-section">
      <div className="container testimonial-inner">
        <p className="section-sub center">What People Say</p>
        <h2 className="section-title center">Stories from Visitors</h2>
        <div className="testimonial-box">
          <p className="testimonial-quote">"{quotes[active].text}"</p>
          <p className="testimonial-author">— {quotes[active].name}, {quotes[active].place}</p>
          <div className="testimonial-dots">
            {quotes.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === active ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="container contact-inner">
        <p className="section-sub center">Get In Touch</p>
        <h2 className="section-title center">Plan Your Visit to<br />Ayarewadi</h2>
        <p className="contact-sub">
          Want to attend a festival, explore the village or learn more?<br />
          Reach out to us — we would love to welcome you.
        </p>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Location</strong>
                <p>Ayarewadi Village, Maharashtra, India</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🌐</span>
              <div>
                <strong>Website</strong>
                <p>ayarewadi.in</p>
              </div>
            </div>
          </div>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows={4} required />
            <button type="submit" className="btn-primary full-width">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Ayarewadi</span>
          <p>A village of culture, nature and community in Maharashtra.</p>
          <div className="footer-social">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
          </div>
        </div>
        <div className="footer-links">
          <h5>Quick Links</h5>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-links">
          <h5>Information</h5>
          <ul>
            <li><a href="#">Nearby Hospitals</a></li>
            <li><a href="#">Nearby Colleges</a></li>
            <li><a href="#">Local News</a></li>
            <li><a href="#">Admin Login</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Ayarewadi Village. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <About />
      <Events />
      <Stats />
      <Experience />
      <Testimonial />
      <Contact />
      <Footer />
    </div>
  );
}