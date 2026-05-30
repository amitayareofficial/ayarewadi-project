import React from 'react';
import { cn } from '@/lib/utils';
import { useInView } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export function LazyImage({
    alt,
    src,
    ratio,
    fallback,
    inView = false,
    className,
    AspectRatioClassName,
}) {
    const ref = React.useRef(null);
    const imgRef = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    const [imgSrc, setImgSrc] = React.useState(inView ? undefined : src);
    const [isLoading, setIsLoading] = React.useState(true);

    const handleError = () => {
        if (fallback) setImgSrc(fallback);
        setIsLoading(false);
    };

    const handleLoad = () => setIsLoading(false);

    React.useEffect(() => {
        if (inView && isInView && !imgSrc) setImgSrc(src);
    }, [inView, isInView, src, imgSrc]);

    React.useEffect(() => {
        if (imgRef.current && imgRef.current.complete) handleLoad();
    }, [imgSrc]);

    return (
        <AspectRatio
            ref={ref}
            ratio={ratio}
            className={cn(
                'relative size-full overflow-hidden rounded-lg border',
                AspectRatioClassName,
            )}
        >
            <div
                className={cn(
                    'bg-accent/30 absolute inset-0 animate-pulse rounded-lg transition-opacity will-change-[opacity]',
                    { 'opacity-0': !isLoading },
                )}
            />
            {imgSrc && (
                <img
                    ref={imgRef}
                    alt={alt}
                    src={imgSrc}
                    className={cn(
                        'size-full rounded-lg object-cover opacity-0 transition-opacity duration-[2000ms] will-change-[opacity]',
                        { 'opacity-100': !isLoading },
                        className,
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    decoding="async"
                    fetchPriority={inView ? 'high' : 'low'}
                />
            )}
        </AspectRatio>
    );
}
