import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API = "https://ayarewadi-project.onrender.com";
const CATEGORIES = ["All", "Village News", "Announcement", "Development", "Culture", "Health", "Education"];

export default function Blog_Page() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/blog`)
      .then(r => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterCat === "All" ? posts : posts.filter(p => p.category === filterCat);

  if (selected) return <BlogPost post={selected} onBack={() => setSelected(null)} />;

  return (
    <section className="blog-section">
      <div className="container">
        <div className="section-eyebrow">गाव बातम्या · Village Blog</div>
        <h2 className="section-title">📝 Blog & Updates</h2>
        <p className="section-sub">Latest news, stories, and updates from Ayarewadi village.</p>

        <div className="blog-filter">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`blog-filter-btn ${filterCat === c ? "active" : ""}`}
              onClick={() => setFilterCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="blog-empty">Loading posts…</p>}

        {!loading && filtered.length === 0 && (
          <p className="blog-empty">No posts yet. Check back soon!</p>
        )}

        <div className="blog-grid">
          {filtered.map(post => (
            <div key={post.id} className="blog-card" onClick={() => setSelected(post)}>
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="blog-card-img" />
              )}
              <div className="blog-card-body">
                <span className="blog-cat-tag">{post.category}</span>
                <h3>{post.title}</h3>
                <p className="blog-excerpt">
                  {post.content.replace(/[#*_`[\]()]/g, "").slice(0, 130)}…
                </p>
                <div className="blog-meta">
                  <span>
                    {new Date(post.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                  <span className="blog-read-more">Read more →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogPost({ post, onBack }) {
  return (
    <section className="blog-post-section">
      <div className="container">
        <button className="blog-back-btn" onClick={onBack}>← Back to Blog</button>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="blog-post-cover" />
        )}

        <div className="blog-post-header">
          <span className="blog-cat-tag">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="blog-post-date">
            {new Date(post.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        <div className="blog-post-content">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
