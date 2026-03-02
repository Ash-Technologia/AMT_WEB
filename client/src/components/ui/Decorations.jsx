import { motion } from 'framer-motion';

// ─── Mandala Backdrop ──────────────────────────────────────────────────────────
export const MandalaBackdrop = ({ className, style }) => (
    <motion.svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ opacity: 0.1, pointerEvents: 'none', ...style }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
    >
        <circle cx="250" cy="250" r="240" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" />
        <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="0.5" />
        {[...Array(24)].map((_, i) => (
            <path
                key={i}
                d={`M250 250 L${250 + 240 * Math.cos((i * 15 * Math.PI) / 180)} ${250 + 240 * Math.sin((i * 15 * Math.PI) / 180)}`}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.3"
            />
        ))}
        <path d="M250 10 Q300 100 250 190 Q200 100 250 10" fill="currentColor" opacity="0.2" transform="rotate(0 250 250)" />
        {[...Array(8)].map((_, i) => (
            <path
                key={i}
                d="M250 50 Q300 150 250 250 Q200 150 250 50"
                fill="currentColor"
                opacity="0.1"
                transform={`rotate(${i * 45} 250 250)`}
            />
        ))}
        <circle cx="250" cy="250" r="50" fill="currentColor" opacity="0.05" />
    </motion.svg>
);

// ─── Lotus Bloom ──────────────────────────────────────────────────────────────
export const LotusBloom = ({ className, style, color = "currentColor" }) => (
    <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ pointerEvents: 'none', ...style }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
    >
        <g opacity="0.2">
            {[...Array(8)].map((_, i) => (
                <path
                    key={i}
                    d="M50 50 Q70 20 50 10 Q30 20 50 50"
                    fill={color}
                    transform={`rotate(${i * 45} 50 50)`}
                />
            ))}
        </g>
        <path d="M50 30 Q60 50 50 70 Q40 50 50 30" fill={color} opacity="0.4" />
    </motion.svg>
);

// ─── Silk Flow ───────────────────────────────────────────────────────────────
export const SilkFlow = ({ className, style }) => (
    <motion.svg
        viewBox="0 0 800 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ pointerEvents: 'none', ...style }}
    >
        <motion.path
            d="M0 100 Q200 20 400 100 T800 100"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.15"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.15 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
            d="M0 120 Q200 40 400 120 T800 120"
            stroke="currentColor"
            strokeWidth="0.3"
            opacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
    </motion.svg>
);

// ─── Ornamental Divider ───────────────────────────────────────────────────────
export const OrnamentalDivider = ({ style }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '40px 0', ...style }}>
        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, var(--border))' }} />
        <LotusBloom style={{ width: '30px', height: '30px', color: 'var(--gold)' }} />
        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
    </div>
);
