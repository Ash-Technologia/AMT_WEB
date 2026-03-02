const Groq = require('groq-sdk');
const Product = require('../models/Product.model');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── CHAT ─────────────────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

        // Build live product context from DB
        let productList = '';
        try {
            const products = await Product.find({ isVisible: true }).select('name price discountPrice description category stock tags').limit(20).lean();
            productList = products.map((p, i) => {
                const price = p.discountPrice ? `₹${p.discountPrice} (was ₹${p.price})` : `₹${p.price}`;
                return `${i + 1}. ${p.name} - ${price} | Category: ${p.category || 'General'} | Stock: ${p.stock > 0 ? 'In Stock' : 'Out of Stock'} | ${p.description?.substring(0, 100)}...`;
            }).join('\n');
        } catch (e) {
            productList = 'Product information temporarily unavailable.';
        }

        const SYSTEM_PROMPT = `You are a helpful, knowledgeable AI assistant for AMT (Advanced Medical Therapeutics), a premium health therapy e-commerce brand based in Amravati, Maharashtra, India.

CURRENT LIVE PRODUCT CATALOG:
${productList}

YOUR ROLE:
- Answer questions about AMT products accurately using the catalog above
- Help customers choose the right product based on their health needs
- Explain product benefits, pricing, and usage
- Assist with orders, shipping, and returns
- Provide general wellness guidance (always recommend consulting a doctor for medical advice)
- If asked about categories, list relevant products from the catalog
- For pricing, always use the exact prices from the catalog
- Be warm, professional, and concise (2-4 sentences max per response)
- If you don't know something specific, offer to connect them with support

CONTACT:
- Email: amrutsinghavi@gmail.com
- Phone: +91 98228 43015
- Location: Amravati, Maharashtra
- Website: amttherapy.in

DO NOT discuss topics unrelated to health, wellness, or AMT products. If asked, politely redirect.`;

        // Sanitize history roles — Groq only accepts 'user' / 'assistant'
        const sanitizedHistory = history
            .slice(-10)
            .map(h => ({
                role: h.role === 'model' ? 'assistant' : h.role,
                content: h.content,
            }))
            .filter(h => ['user', 'assistant'].includes(h.role));

        // Build messages array for Groq (OpenAI-compatible format)
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...sanitizedHistory,
            { role: 'user', content: message },
        ];

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 600,
            temperature: 0.4,
            top_p: 0.9,
        });

        const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        res.json({ success: true, response });
    } catch (err) {
        console.error('Chat error:', err.message);
        const isQuotaError = err.message?.includes('429') || err.message?.includes('rate limit') || err.message?.includes('quota');
        const msg = isQuotaError
            ? 'Our AI assistant is temporarily busy. Please try again in a minute, or contact us at amrutsinghavi@gmail.com / +91 98228 43015.'
            : 'AI assistant temporarily unavailable. Contact us at amrutsinghavi@gmail.com';
        res.status(500).json({ success: false, message: msg });
    }
};
