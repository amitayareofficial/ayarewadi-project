import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get("https://ayarewadi-project.onrender.com/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="website">

      {/* NAVBAR */}

      <nav className="navbar">
        <div className="logo">Ayarewadi</div>

        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>Experiences</li>
          <li>Events</li>
          <li>Contact</li>
        </ul>
      </nav>

      {/* HERO SECTION */}

      <section className="hero">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <p className="hero-small-text">
            SUSTAINABLE TOURISM
          </p>

          <h1>
            Experience <br />
            Village Life
          </h1>

          <p className="hero-description">
            Discover authentic rural culture, local traditions,
            eco-tourism experiences, and peaceful nature in
            Ayarewadi.
          </p>

          <button>
            Explore Village
          </button>

        </div>

      </section>

      {/* ABOUT SECTION */}

      <section className="about-section">

        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt="village"
          />
        </div>

        <div className="about-content">

          <p className="section-tag">
            ABOUT AYAREWADI
          </p>

          <h2>
            Sustainable Tourism
            <br />
            In The Heart Of Nature
          </h2>

          <p>
            Ayarewadi offers visitors a unique opportunity to
            experience village life through eco-tourism,
            traditional farming, local cuisine, cultural
            festivals, and peaceful landscapes.
          </p>

        </div>

      </section>

      {/* EVENTS SECTION */}

      <section className="events-section">

        <div className="events-header">
          <p className="section-tag">
            UPCOMING EVENTS
          </p>

          <h2>
            Village Experiences & Festivals
          </h2>
        </div>

        <div className="event-grid">

          {events.map((event) => (
            <div className="event-card" key={event.id}>

              <h3>{event.title}</h3>

              <p>
                Experience authentic traditions and community
                celebrations in Ayarewadi village.
              </p>

            </div>
          ))}

        </div>

      </section>

      {/* EXPERIENCE SECTION */}

      <section className="experience-section">

        <div className="experience-left">

          <p className="section-tag">
            VILLAGE EXPERIENCES
          </p>

          <h2>
            Explore Rural
            <br />
            Maharashtra
          </h2>

          <p>
            Enjoy trekking, farming activities, local food,
            traditional art, village stays, and peaceful nature.
          </p>

        </div>

        <div className="experience-right">

          <div className="experience-card">
            <h3>Village Stay</h3>
          </div>

          <div className="experience-card">
            <h3>Local Food</h3>
          </div>

          <div className="experience-card">
            <h3>Nature Trails</h3>
          </div>

          <div className="experience-card">
            <h3>Traditional Farming</h3>
          </div>

        </div>

      </section>

    </div>
  );
}

export default App;
