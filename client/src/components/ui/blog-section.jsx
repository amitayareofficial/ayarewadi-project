import React from 'react';
import { cn } from '@/lib/utils';

const PLACEHOLDER =
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80';

function estimateReadTime(content = '') {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 200))} min`;
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function stripMarkdown(text = '') {
    return text
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/[*_`>~\-]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
}

function ArrowIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

/* ── Featured (first) post ─────────────────────────────── */
function FeaturedCard({ post, onSelect }) {
    const [loaded, setLoaded] = React.useState(false);
    const [src, setSrc] = React.useState(post.cover_image || PLACEHOLDER);

    return (
        <button
            onClick={() => onSelect?.(post)}
            className="group w-full text-left focus:outline-none"
        >
            <div
                className={cn(
                    'grid md:grid-cols-[55fr_45fr] overflow-hidden rounded-2xl border border-border/50',
                    'bg-card transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(46,125,50,0.12)]',
                    'min-h-[240px] md:min-h-[360px]',
                )}
            >
                {/* Image side */}
                <div className="relative overflow-hidden bg-accent/20">
                    {!loaded && (
                        <div className="absolute inset-0 animate-pulse bg-accent/30" />
                    )}
                    <img
                        src={src}
                        alt={post.title}
                        onLoad={() => setLoaded(true)}
                        onError={() => {
                            setSrc(PLACEHOLDER);
                            setLoaded(true);
                        }}
                        className={cn(
                            'absolute inset-0 h-full w-full object-cover',
                            'transition-transform duration-700 group-hover:scale-[1.04]',
                            loaded ? 'opacity-100' : 'opacity-0',
                        )}
                        loading="eager"
                    />
                    {/* Category pill on image */}
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow">
                        {post.category}
                    </span>
                </div>

                {/* Content side */}
                <div className="flex flex-col justify-between gap-4 bg-card p-6 sm:p-8">
                    <div className="flex flex-col gap-3">
                        <span className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-primary md:block">
                            Featured Story
                        </span>
                        <h2
                            className={cn(
                                'line-clamp-4 text-xl font-bold leading-snug text-foreground',
                                'transition-colors duration-200 group-hover:text-primary',
                                'sm:text-2xl lg:text-[1.6rem] lg:leading-tight',
                            )}
                        >
                            {post.title}
                        </h2>
                        <p className="hidden text-sm leading-relaxed text-muted-foreground line-clamp-4 sm:block">
                            {stripMarkdown(post.content).slice(0, 230)}…
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-4">
                        <span className="text-xs text-muted-foreground">
                            {formatDate(post.created_at)}&nbsp;·&nbsp;{estimateReadTime(post.content)} read
                        </span>
                        <span
                            className={cn(
                                'flex items-center gap-1 text-xs font-semibold text-primary',
                                'transition-all duration-200 group-hover:gap-2.5',
                            )}
                        >
                            Read more <ArrowIcon />
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

/* ── Regular grid card ─────────────────────────────────── */
function PostCard({ post, onSelect }) {
    const [loaded, setLoaded] = React.useState(false);
    const [src, setSrc] = React.useState(post.cover_image || PLACEHOLDER);

    return (
        <button
            onClick={() => onSelect?.(post)}
            className="group flex w-full flex-col text-left focus:outline-none"
        >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border/30 bg-accent/20">
                {!loaded && (
                    <div className="absolute inset-0 animate-pulse bg-accent/30" />
                )}
                <img
                    src={src}
                    alt={post.title}
                    onLoad={() => setLoaded(true)}
                    onError={() => {
                        setSrc(PLACEHOLDER);
                        setLoaded(true);
                    }}
                    className={cn(
                        'absolute inset-0 h-full w-full object-cover',
                        'transition-transform duration-500 group-hover:scale-[1.06]',
                        loaded ? 'opacity-100' : 'opacity-0',
                    )}
                    loading="lazy"
                />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {post.category}
                </span>
                <h3
                    className={cn(
                        'line-clamp-3 text-[0.92rem] font-bold leading-snug text-foreground',
                        'transition-colors duration-200 group-hover:text-primary',
                        'sm:text-[0.97rem]',
                    )}
                >
                    {post.title}
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground/75">
                    {formatDate(post.created_at)}&nbsp;·&nbsp;{estimateReadTime(post.content)} read
                </p>
            </div>
        </button>
    );
}

/* ── Public export ─────────────────────────────────────── */
export function BlogSection({ posts = [], onSelect }) {
    if (posts.length === 0) return null;

    const [featured, ...rest] = posts;

    return (
        <div className="flex flex-col gap-10 sm:gap-14">
            <FeaturedCard post={featured} onSelect={onSelect} />

            {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                        <PostCard key={post.id} post={post} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}
