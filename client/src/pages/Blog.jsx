import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API        = 'https://ayarewadi-project.onrender.com';
const FALLBACK   = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80';
const CATEGORIES = ['All', 'Village News', 'Announcement', 'Development', 'Culture', 'Health', 'Education'];

function calcReadTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
function stripMd(text = '') {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/#{1,6}\s/g, '').replace(/[*_`>~]/g, '')
    .replace(/\n+/g, ' ').trim();
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function BlogSkeleton() {
  return (
    <div className="blog-skeleton">
      <div className="blog-skel-feat">
        <div className="blog-skel-feat-img" />
        <div className="blog-skel-feat-body">
          <div className="blog-skel-line w60" />
          <div className="blog-skel-line" style={{ height: 28 }} />
          <div className="blog-skel-line" style={{ height: 28, width: '80%' }} />
          <div className="blog-skel-line" />
          <div className="blog-skel-line w60" />
          <div className="blog-skel-line" style={{ width: 120, height: 40, borderRadius: 8 }} />
        </div>
      </div>
      <div className="blog-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="blog-skel-card">
            <div className="blog-skel-card-img" />
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="blog-skel-line w40" />
              <div className="blog-skel-line" />
              <div className="blog-skel-line" style={{ width: '75%' }} />
              <div className="blog-skel-line w60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Blog_Page() {
  const [posts, setPosts]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    axios.get(`${API}/blog`)
      .then(r => { setPosts(r.data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts
    .filter(p => filterCat === 'All' || p.category === filterCat)
    .filter(p => !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()));

  if (selected) return <BlogPost post={selected} onBack={() => setSelected(null)} />;

  const [featured, ...rest] = filtered;

  return (
    <div className="blog-page">

      {/* ── HERO ── */}
      <section className="blog-hero">
        <h1 className="blog-hero-title">ब्लॉग · Blog &amp; Updates</h1>
        <p className="blog-hero-sub">आयरेवाडी गावातील ताज्या बातम्या व कथा</p>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="blog-filter-bar">
        <div className="blog-filter-inner">
          <div className="blog-pills-scroll">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`blog-pill${filterCat === c ? ' active' : ''}`}
                onClick={() => setFilterCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="blog-search-wrap">
            <svg className="blog-search-icon" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="blog-search-input"
              placeholder="Search posts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="blog-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="blog-content">

        {loading && <BlogSkeleton />}

        {!loading && error && (
          <div className="blog-state">
            <span className="blog-state-emoji">⚠️</span>
            <p>पोस्ट लोड होत नाहीत. कृपया इंटरनेट कनेक्शन तपासा.</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="blog-state">
            <span className="blog-state-emoji">🔍</span>
            <p>कोणतेही पोस्ट सापडले नाही</p>
            {(filterCat !== 'All' || search) && (
              <button className="blog-reset-btn" onClick={() => { setFilterCat('All'); setSearch(''); }}>
                सर्व पोस्ट पाहा
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            {/* FEATURED */}
            <article
              className="blog-featured"
              onClick={() => setSelected(featured)}
              role="button" tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelected(featured)}
            >
              <div className="blog-feat-img-col">
                <img
                  src={featured.cover_image || FALLBACK}
                  alt={featured.title}
                  className="blog-feat-img"
                  onError={e => { e.target.src = FALLBACK; }}
                  loading="eager"
                />
                <span className="blog-cat-badge">{featured.category}</span>
              </div>
              <div className="blog-feat-body">
                <p className="blog-feat-eyebrow">Featured Story</p>
                <h2 className="blog-feat-title">{featured.title}</h2>
                <p className="blog-feat-excerpt">{stripMd(featured.content).slice(0, 220)}…</p>
                <p className="blog-feat-meta">
                  {fmtDate(featured.created_at)}&nbsp;&nbsp;·&nbsp;&nbsp;{calcReadTime(featured.content)}
                </p>
                <span className="blog-feat-btn">वाचा → Read More</span>
              </div>
            </article>

            {/* GRID */}
            {rest.length > 0 && (
              <div className="blog-grid">
                {rest.map(post => (
                  <article
                    key={post.id}
                    className="blog-card"
                    onClick={() => setSelected(post)}
                    role="button" tabIndex={0}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelected(post)}
                  >
                    <div className="blog-card-img-wrap">
                      <img
                        src={post.cover_image || FALLBACK}
                        alt={post.title}
                        className="blog-card-img"
                        onError={e => { e.target.src = FALLBACK; }}
                        loading="lazy"
                      />
                      <span className="blog-cat-badge sm">{post.category}</span>
                    </div>
                    <div className="blog-card-body">
                      <h3 className="blog-card-title">{post.title}</h3>
                      <p className="blog-card-excerpt">{stripMd(post.content).slice(0, 115)}…</p>
                      <div className="blog-card-meta">
                        <span>{fmtDate(post.created_at)}</span>
                        <span>{calcReadTime(post.content)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

function BlogPost({ post, onBack }) {
  const readTime = calcReadTime(post.content || '');

  return (
    <div className="blog-post-page">
      <div className="blog-post-container">
        <button className="blog-back-btn" onClick={onBack}>← Blog वर परत जा</button>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="blog-post-cover" loading="eager" />
        )}

        <div className="blog-post-header">
          <span className="blog-cat-badge">{post.category}</span>
          <h1 className="blog-post-title">{post.title}</h1>
          <p className="blog-post-date">
            {new Date(post.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            &nbsp;·&nbsp;{readTime}
          </p>
        </div>

        <div className="blog-post-content">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="blog-post-footer">
          <button className="blog-back-btn" onClick={onBack}>← Blog वर परत जा</button>
        </div>
      </div>
    </div>
  );
}
