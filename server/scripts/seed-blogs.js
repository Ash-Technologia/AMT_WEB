require('dotenv').config();
const mongoose = require('mongoose');

const blogs = [
    {
        title: 'The Ancient Science of Ayurveda: A Beginner\'s Guide',
        slug: 'ancient-science-of-ayurveda',
        excerpt: 'Discover how the 5,000-year-old science of Ayurveda can transform your well-being through natural remedies, personalized nutrition, and mindful living.',
        content: `Ayurveda, meaning "science of life" in Sanskrit, is one of the world's oldest holistic healing systems developed more than 3,000 years ago in India. It is based on the belief that health and wellness depend on a delicate balance between the mind, body, and spirit.\n\nThe primary goal of Ayurveda is to promote good health rather than fight disease. However, treatments may be geared toward specific health problems.\n\n## The Three Doshas\n\nAccording to Ayurvedic philosophy, every person is made of five basic elements found in the universe: space, air, fire, water, and earth. These elements combine in the human body to form three life forces called doshas — Vata, Pitta, and Kapha.\n\n**Vata dosha** (space and air): This is believed to control very basic body functions like cell division. It also controls your mind, breathing, blood flow, heart function, and ability to get rid of intestinal waste.\n\n**Pitta dosha** (fire and water): This energy controls your digestion, metabolism (how well you break down foods), and certain hormones that are linked to your appetite.\n\n**Kapha dosha** (water and earth): This energy controls muscle growth, body strength and stability, weight, and your immune system.\n\n## Ayurvedic Treatments\n\nAyurvedic treatment starts with an internal purification process, followed by a special diet, herbal remedies, massage therapy, yoga, and meditation. The concepts of universal interconnectedness, the body\'s constitution, and life forces form the basis of Ayurvedic medicine.`,
        coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
        tags: ['Ayurveda', 'Wellness', 'Holistic Health'],
        author: 'Dr. Priya Sharma',
        isPublished: true,
    },
    {
        title: 'Ashwagandha: The King of Ayurvedic Herbs',
        slug: 'ashwagandha-king-of-ayurvedic-herbs',
        excerpt: 'Explore the powerful adaptogenic properties of Ashwagandha and how this ancient herb can help manage stress, boost energy, and improve overall vitality.',
        content: `Ashwagandha (Withania somnifera), also known as Indian ginseng or winter cherry, is one of the most important herbs in Ayurveda, a traditional form of alternative medicine based on Indian principles of natural healing.\n\nFor thousands of years, people have used the roots and orange-red fruit of ashwagandha for medicinal purposes. The herb is considered an adaptogen, meaning it can help your body manage stress.\n\n## Key Benefits\n\n### 1. May Reduce Stress and Anxiety\nAshwagandha is perhaps best known for its ability to reduce stress. It's classified as an adaptogen, a substance that helps the body cope with stress. Ashwagandha appears to help control mediators of stress, including heat shock proteins (Hsp70), cortisol, and stress-activated c-Jun N-terminal protein kinase (JNK-1).\n\n### 2. May Benefit Athletic Performance\nSome research suggests that ashwagandha may have beneficial effects on athletic performance and may be a worthwhile supplement for athletes.\n\n### 3. May Help Reduce Symptoms of Some Mental Health Conditions\nSome evidence suggests that ashwagandha may help reduce symptoms of other mental health conditions, including depression, in certain populations.\n\n## How to Use Ashwagandha\n\nAshwagandha is available in many forms, including capsules, powders, and liquid extracts. You can take it with water, juice, smoothies, or incorporate the powder into foods.`,
        coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        tags: ['Ashwagandha', 'Adaptogens', 'Stress Relief'],
        author: 'Dr. Raj Patel',
        isPublished: true,
    },
    {
        title: 'Triphala: The Three-Fruit Powerhouse for Digestive Health',
        slug: 'triphala-digestive-health',
        excerpt: 'Learn about Triphala, the classic Ayurvedic formula combining three fruits to support digestion, detoxification, and immune function.',
        content: `Triphala is an ancient Ayurvedic herbal formulation consisting of three fruits: Amalaki (Emblica officinalis), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula).\n\nThis combination has been used in Ayurvedic medicine for thousands of years and is one of the most commonly used formulations in the practice. It is considered a tridoshic rasayana—a formula that balances all three doshas.\n\n## The Three Components\n\n**Amalaki (Indian Gooseberry)**: This fruit is an extremely nourishing herb that is high in vitamin C. It is considered a premier rejuvenating herb in Ayurveda and is known for its ability to nourish and tonify all of the body's tissues.\n\n**Bibhitaki**: This fruit is particularly good for Kapha constitution. It is commonly used by Kapha types for its ability to address health concerns involving excess mucus and water in the body.\n\n**Haritaki**: This fruit is often referred to as the "king of medicines" in Tibetan medicine. It supports the proper function of the colon, which is home to Vata dosha.`,
        coverImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
        tags: ['Triphala', 'Digestion', 'Detox'],
        author: 'Dr. Meera Nair',
        isPublished: true,
    },
    {
        title: 'Morning Rituals: Starting Your Day the Ayurvedic Way',
        slug: 'morning-rituals-ayurvedic-way',
        excerpt: 'Transform your mornings with ancient Ayurvedic practices like oil pulling, tongue scraping, and warm water drinking that energize body and mind.',
        content: `In Ayurveda, the early morning hours are considered sacred and are referred to as "Brahma Muhurta" — the creator's time. This period, roughly 90 minutes before sunrise, is said to be ideal for spiritual practices and setting the tone for the rest of the day.\n\n## Dinacharya: Daily Routine\n\nAyurveda places great importance on a consistent daily routine, called dinacharya. The morning routine in particular helps to cleanse the body of toxins that have accumulated overnight and prepares the physical and mental body for the day ahead.\n\n### Step 1: Wake Early\nIdeally, you should rise before sunrise. The Vata period of the morning (from 2-6 AM) is light and clear, making it the perfect time for meditation and spiritual practice.\n\n### Step 2: Scrape Your Tongue\nTongue scraping removes the coating that appears on the tongue during sleep, which results from the digestive process. Use a tongue scraper (made preferably of copper or stainless steel) and gently scrape from the back of the tongue forward 7-14 times.\n\n### Step 3: Oil Pulling\nSwish 1 tablespoon of sesame or coconut oil in your mouth for 15-20 minutes. This ancient practice is said to pull toxins from the mouth and improve oral health.\n\n### Step 4: Warm Water\nDrink a glass or two of warm water first thing in the morning. This helps to cleanse the kidneys and stimulate bowel movements.`,
        coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        tags: ['Morning Routine', 'Wellness', 'Dinacharya'],
        author: 'Dr. Ananya Singh',
        isPublished: true,
    },
    {
        title: 'Turmeric & Its Miraculous Healing Properties',
        slug: 'turmeric-healing-properties',
        excerpt: 'Curcumin in turmeric is nature\'s most powerful anti-inflammatory. Discover how to harness the full benefits of this golden spice in your daily life.',
        content: `Turmeric (Curcuma longa) is a flowering plant of the ginger family. The rhizomes are used fresh or boiled in water and dried, after which they are ground into a deep orange-yellow powder commonly used as a coloring and flavoring agent in many Asian cuisines.\n\nIn Ayurveda, turmeric is one of the most important herbs and has been used for thousands of years as both a medicinal plant and a beautifying herb.\n\n## The Power of Curcumin\n\nThe main active ingredient in turmeric is curcumin. It has powerful anti-inflammatory effects and is a very strong antioxidant. However, the curcumin content of turmeric is not that high — it's only around 3% by weight. Most studies on this herb are using turmeric extracts that contain mostly curcumin itself, with dosages usually exceeding 1 gram per day.\n\n## Amazing Benefits\n\n**Anti-Inflammatory**: Chronic inflammation is known to be a contributor to many common health conditions. Curcumin can inhibit many molecules known to play major roles in inflammation.\n\n**Antioxidant**: Oxidative damage is believed to be one of the mechanisms behind aging and many diseases. Curcumin happens to be a potent antioxidant that can neutralize free radicals due to its chemical structure.\n\n**Brain Health**: Curcumin boosts Brain-Derived Neurotrophic Factor (BDNF), which increases the growth of new neurons and fights various degenerative processes in the brain.`,
        coverImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
        tags: ['Turmeric', 'Anti-inflammatory', 'Curcumin'],
        author: 'Dr. Vikram Desai',
        isPublished: true,
    },
    {
        title: 'Yoga & Ayurveda: Sisters of Healing',
        slug: 'yoga-and-ayurveda-sisters-of-healing',
        excerpt: 'Yoga and Ayurveda share the same ancient roots. Discover how combining these sister sciences creates optimal health for body, mind, and spirit.',
        content: `Yoga and Ayurveda are two branches of the same ancient tree of Vedic wisdom that together provide a complete path to total well-being. While Yoga is primarily a spiritual science focused on the liberation of the soul, Ayurveda is a healing science that maintains health and treats disease in the mind-body complex.\n\n## The Connection\n\nBoth sciences are rooted in the Vedic philosophy of life. They share a common understanding of the nature of the universe as composed of five elements (earth, water, fire, air, and ether) and three qualities (Sattva, Rajas, and Tamas). Both systems look at the human being as a microcosm of the universe.\n\n## How Yoga Supports Ayurveda\n\n**Physical Postures (Asana)**: Different yoga postures affect the doshas in different ways. For example, forward bends are calming for Pitta and can reduce excess heat in the body. Backbends are warming and stimulating, which is good for Kapha types.\n\n**Breathing Practices (Pranayama)**: Breath control techniques can help balance all three doshas. Alternate nostril breathing (Nadi Shodhana) is particularly effective for balancing all doshas.\n\n**Meditation**: Regular meditation practice supports mental clarity and emotional balance, which are both essential aspects of Ayurvedic health maintenance.`,
        coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        tags: ['Yoga', 'Ayurveda', 'Mind-Body'],
        author: 'Dr. Priya Sharma',
        isPublished: true,
    },
];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const col = mongoose.connection.collection('blogs');
        const existing = await col.countDocuments();
        if (existing > 0) {
            console.log(`${existing} blogs already exist. Skipping seed.`);
            await mongoose.disconnect();
            return;
        }
        const now = new Date();
        const docsWithDates = blogs.map((b, i) => ({
            ...b,
            createdAt: new Date(now - i * 3 * 24 * 60 * 60 * 1000), // stagger by 3 days
            updatedAt: now,
        }));
        await col.insertMany(docsWithDates);
        console.log(`Seeded ${blogs.length} blogs.`);
        await mongoose.disconnect();
    })
    .catch(err => { console.error(err); process.exit(1); });
