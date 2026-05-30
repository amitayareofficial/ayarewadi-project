import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { BlogSection } from '@/components/ui/blog-section';

const API = 'https://ayarewadi-project.onrender.com';
const CATEGORIES = [
    'All',
    'Village News',
    'Announcement',
    'Development',
    'Culture',
    'Health',
    'Education',
];

/* ── Skeleton that mirrors featured + 3-col grid ─────── */
function BlogSkeleton() {
    return (
        <div className="flex flex-col gap-10 sm:gap-14 animate-pulse">
            {/* Featured skeleton */}
            <div className="grid md:grid-cols-[55fr_45fr] rounded-2xl overflow-hidden border border-border/40 min-h-[240px] md:min-h-[360px]">
                <div className="bg-accent/30" />
                <div className="bg-card p-6 sm:p-8 flex flex-col gap-4">
                    <div className="h-3 w-20 rounded bg-accent/40" />
                    <div className="flex flex-col gap-2.5">
                        <div className="h-6 w-full rounded bg-accent/40" />
                        <div className="h-6 w-4/5 rounded bg-accent/40" />
                        <div className="h-6 w-2/3 rounded bg-accent/30" />
                    </div>
                    <div className="mt-auto flex flex-col gap-2">
                        <div className="h-3 w-full rounded bg-accent/30" />
                        <div className="h-3 w-full rounded bg-accent/30" />
                        <div className="h-3 w-3/5 rounded bg-accent/20" />
                    </div>
                    <div className="border-t border-border/30 pt-4 flex justify-between">
                        <div className="h-3 w-28 rounded bg-accent/30" />
                        <div className="h-3 w-20 rounded bg-accent/30" />
                    </div>
                </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <div className="aspect-[16/9] rounded-xl bg-accent/30" />
                        <div className="h-2.5 w-16 rounded bg-accent/40" />
                        <div className="h-4 w-full rounded bg-accent/40" />
                        <div className="h-4 w-4/5 rounded bg-accent/40" />
                        <div className="h-4 w-2/3 rounded bg-accent/30" />
                        <div className="h-2.5 w-24 rounded bg-accent/30 mt-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Main blog list page ─────────────────────────────── */
export default function Blog_Page() {
    const [posts, setPosts]           = useState([]);
    const [selected, setSelected]     = useState(null);
    const [filterCat, setFilterCat]   = useState('All');
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(false);

    useEffect(() => {
        axios
            .get(`${API}/blog`)
            .then((r) => { setPosts(r.data); setError(false); })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const filtered =
        filterCat === 'All'
            ? posts
            : posts.filter((p) => p.category === filterCat);

    if (selected)
        return <BlogPost post={selected} onBack={() => setSelected(null)} />;

    return (
        <section
            className="min-h-screen bg-background"
            style={{ paddingTop: '56px' }}
        >
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">

                {/* ── Page header ── */}
                <header className="mb-8 sm:mb-10">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-px w-8 bg-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                            गाव बातम्या
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-none mb-3">
                        Blog & Updates
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Latest news, stories, and updates from Ayarewadi village.
                    </p>
                </header>

                {/* ── Tab filter ── */}
                <div className="overflow-x-auto -mx-4 px-4 mb-10 sm:mb-12 scrollbar-none">
                    <div
                        className="flex border-b border-border/60"
                        style={{ minWidth: 'max-content' }}
                    >
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                onClick={() => setFilterCat(c)}
                                className={cn(
                                    'px-4 py-3 text-[13px] font-medium whitespace-nowrap',
                                    'border-b-2 -mb-px transition-all duration-200',
                                    filterCat === c
                                        ? 'border-primary text-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                                )}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content states ── */}
                {loading && <BlogSkeleton />}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                        <span className="text-5xl">⚠️</span>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Unable to load posts. Please check your connection and try again.
                        </p>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                        <span className="text-5xl">📭</span>
                        <p className="text-muted-foreground text-sm">
                            {filterCat === 'All'
                                ? 'No posts yet. Check back soon!'
                                : `No posts in "${filterCat}" yet.`}
                        </p>
                        {filterCat !== 'All' && (
                            <button
                                onClick={() => setFilterCat('All')}
                                className="text-xs font-medium text-primary underline underline-offset-2"
                            >
                                View all posts
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <BlogSection posts={filtered} onSelect={setSelected} />
                )}

            </div>
        </section>
    );
}

/* ── Individual post reading view ───────────────────── */
function BlogPost({ post, onBack }) {
    const readTime = (() => {
        const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
        return `${Math.max(1, Math.round(words / 200))} min read`;
    })();

    return (
        <section
            className="min-h-screen bg-background"
            style={{ paddingTop: '56px' }}
        >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">

                {/* Back */}
                <button
                    onClick={onBack}
                    className={cn(
                        'mb-10 inline-flex items-center gap-2 text-xs font-medium',
                        'text-muted-foreground hover:text-primary transition-colors',
                    )}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to Blog
                </button>

                {/* Meta */}
                <div className="mb-6 flex items-center gap-2.5">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                        &nbsp;·&nbsp;{readTime}
                    </span>
                </div>

                {/* Title */}
                <h1 className="mb-8 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
                    {post.title}
                </h1>

                {/* Cover image */}
                {post.cover_image && (
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="mb-10 w-full max-h-[400px] object-cover rounded-2xl border border-border/30"
                        loading="eager"
                    />
                )}

                <div className="h-px w-full bg-border/40 mb-10" />

                {/* Article body */}
                <div
                    className={cn(
                        'prose prose-stone max-w-none',
                        'prose-headings:font-bold prose-headings:text-foreground prose-headings:leading-tight',
                        'prose-p:text-muted-foreground prose-p:leading-[1.8]',
                        'prose-strong:text-foreground prose-strong:font-semibold',
                        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                        'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
                        'prose-code:text-primary prose-code:bg-accent/40 prose-code:rounded prose-code:px-1',
                        'prose-img:rounded-xl prose-img:border prose-img:border-border/30',
                    )}
                >
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Footer back */}
                <div className="mt-14 pt-8 border-t border-border/40">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        Back to all posts
                    </button>
                </div>

            </div>
        </section>
    );
}
