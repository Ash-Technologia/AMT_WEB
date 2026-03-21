import { useState, useRef, useEffect } from 'react';

/**
 * BlurImage — Progressive image loader with blur-up placeholder.
 * Pass `src` (full quality) and optionally `placeholder` (tiny base64 or thumb URL).
 */
const BlurImage = ({
    src,
    alt = '',
    placeholder,
    className = '',
    style = {},
    width,
    height,
    ...rest
}) => {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    // If already cached (browser), mark loaded immediately
    useEffect(() => {
        if (imgRef.current?.complete) setLoaded(true);
    }, []);

    return (
        <div
            style={{
                position: 'relative',
                overflow: 'hidden',
                width: width || '100%',
                height: height || '100%',
                background: 'var(--surface)',
                ...style,
            }}
        >
            {/* Blur placeholder */}
            {placeholder && (
                <img
                    src={placeholder}
                    alt=""
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'blur(12px)',
                        transform: 'scale(1.05)',
                        opacity: loaded ? 0 : 1,
                        transition: 'opacity 0.4s ease',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Full image */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={className}
                onLoad={() => setLoaded(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    display: 'block',
                }}
                {...rest}
            />

            {/* Skeleton shimmer while loading */}
            {!loaded && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                    }}
                />
            )}
        </div>
    );
};

export default BlurImage;
