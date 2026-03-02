import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — Adds scroll-triggered reveal animations via IntersectionObserver.
 * 
 * Usage:
 *   const ref = useScrollReveal();
 *   <div ref={ref} className="reveal delay-2">...</div>
 * 
 * Or for a container that reveals all children:
 *   const ref = useScrollReveal({ selector: '.reveal, .reveal-left, .reveal-right, .reveal-scale' });
 *   <section ref={ref}>
 *     <div className="reveal">...</div>
 *   </section>
 */
const useScrollReveal = ({
    threshold = 0.12,
    rootMargin = '0px 0px -60px 0px',
    selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale',
    once = true,
} = {}) => {
    const ref = useRef(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            // Immediately reveal all elements
            const elements = container.querySelectorAll(selector);
            elements.forEach(el => el.classList.add('revealed'));
            // Also check if container itself is a reveal element
            if (container.classList.contains('reveal') ||
                container.classList.contains('reveal-left') ||
                container.classList.contains('reveal-right') ||
                container.classList.contains('reveal-scale')) {
                container.classList.add('revealed');
            }
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        if (once) observer.unobserve(entry.target);
                    } else if (!once) {
                        entry.target.classList.remove('revealed');
                    }
                });
            },
            { threshold, rootMargin }
        );

        // Observe children matching selector
        const elements = container.querySelectorAll(selector);
        elements.forEach(el => observer.observe(el));

        // Also observe the container itself if it's a reveal element
        if (
            container.classList.contains('reveal') ||
            container.classList.contains('reveal-left') ||
            container.classList.contains('reveal-right') ||
            container.classList.contains('reveal-scale')
        ) {
            observer.observe(container);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin, selector, once]);

    return ref;
};

export default useScrollReveal;
