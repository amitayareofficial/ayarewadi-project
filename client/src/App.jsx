import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get("https://ayarewadi-project.onrender.com/events")
      .then((res) => setEvents(res.data));
  }, []);

  return (
    <div>
      <h1>Village Events</h1>

      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.title}</h3>
        </div>
      ))}
    </div>
  );
}

export default App;
