const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Settings = require('../models/Settings.model');

const products = [
    {
        name: 'Earth Therapy Belt',
        slug: 'earth-therapy-belt',
        description: 'The Earth Therapy Belt harnesses the natural healing power of grounding therapy. Designed for pain relief, improved circulation, and deep muscle relaxation. Ideal for back pain, joint stiffness, and post-workout recovery.',
        howToUse: 'Wrap the belt around the affected area. Ensure skin contact for optimal grounding effect. Wear for 20-30 minutes daily for best results.',
        instructions: 'Clean the area before use. Do not use on open wounds. Store in a cool, dry place. Consult your physician if you have a pacemaker.',
        price: 560,
        discountPrice: 499,
        stock: 50,
        images: [
            { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', publicId: 'placeholder_1' },
        ],
        tags: ['therapy', 'belt', 'pain relief', 'grounding'],
        isVisible: true,
    },
    {
        name: 'Zero Volt Therapy Set',
        slug: 'zero-volt-therapy-set',
        description: 'A complete zero-voltage therapy kit designed to neutralize static electricity in the body, promoting cellular healing and reducing inflammation. Includes all accessories for a full-body therapy session.',
        howToUse: 'Connect the device as per the included guide. Start with the lowest setting. Use for 15-20 minutes per session. Gradually increase intensity as comfortable.',
        instructions: 'Keep away from water. Do not use while sleeping. Suitable for ages 18+. Not recommended during pregnancy.',
        price: 1180,
        discountPrice: 999,
        stock: 30,
        images: [
            { url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800', publicId: 'placeholder_2' },
        ],
        tags: ['therapy', 'zero volt', 'inflammation', 'healing'],
        isVisible: true,
    },
    {
        name: 'Calf Muscle Push-up',
        slug: 'calf-muscle-push-up',
        description: 'Advanced calf muscle therapy device that uses targeted pressure and vibration to strengthen and rehabilitate calf muscles. Perfect for athletes, elderly care, and post-injury recovery.',
        howToUse: 'Place feet on the device. Select desired intensity level. Perform 3 sets of 15-20 repetitions. Use daily for progressive improvement.',
        instructions: 'Ensure device is on a stable surface. Do not exceed recommended intensity. Consult physiotherapist for injury recovery use.',
        price: 2350,
        discountPrice: 1999,
        stock: 25,
        images: [
            { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', publicId: 'placeholder_3' },
        ],
        tags: ['calf', 'muscle', 'rehabilitation', 'fitness'],
        isVisible: true,
    },
    {
        name: 'Hot Water VASO Stimulation',
        slug: 'hot-water-vaso-stimulation',
        description: 'Premium vascular stimulation therapy system using precisely controlled hot water circulation. Enhances blood flow, reduces arterial stiffness, and promotes cardiovascular health. Medical-grade technology for home use.',
        howToUse: 'Fill the reservoir with clean water. Set temperature between 38-42°C. Apply the therapy pads to target areas. Run 30-minute sessions twice daily.',
        instructions: 'Check water temperature before use. Do not exceed 45°C. Not suitable for diabetic neuropathy without medical supervision. Clean after every use.',
        price: 12999,
        discountPrice: 11499,
        stock: 15,
        images: [
            { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', publicId: 'placeholder_4' },
        ],
        tags: ['vascular', 'hot water', 'cardiovascular', 'premium'],
        isVisible: true,
    },
    {
        name: 'GRAD Tub',
        slug: 'grad-tub',
        description: 'The GRAD (Gradient Aqua Dynamics) Tub is our flagship full-body hydrotherapy solution. Features gradient pressure zones, chromotherapy lighting, and mineral-infused water jets for the ultimate therapeutic experience.',
        howToUse: 'Fill with water at recommended temperature. Add mineral salts if desired. Set gradient pressure zones. Immerse for 20-40 minutes. Use 3-4 times per week.',
        instructions: 'Requires professional installation. Ensure proper drainage. Regular maintenance required. Not suitable for individuals with severe cardiovascular conditions without medical clearance.',
        price: 25000,
        discountPrice: 22999,
        stock: 10,
        images: [
            { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', publicId: 'placeholder_5' },
        ],
        tags: ['hydrotherapy', 'tub', 'luxury', 'full body'],
        isVisible: true,
    },
    {
        name: 'Smart Living Water',
        slug: 'smart-living-water',
        description: 'Intelligent water therapy system that structures and energizes drinking water using bio-resonance technology. Enhances hydration at the cellular level, improves nutrient absorption, and supports overall wellness.',
        howToUse: 'Pour water into the device. Allow 3-5 minutes for structuring. Drink 2-3 liters of structured water daily for optimal results.',
        instructions: 'Use only clean, filtered water. Clean device weekly. Replace filter every 3 months. Store away from electromagnetic devices.',
        price: 2899,
        discountPrice: 2499,
        stock: 40,
        images: [
            { url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', publicId: 'placeholder_6' },
        ],
        tags: ['water', 'hydration', 'wellness', 'smart'],
        isVisible: true,
    },
];

const settings = [
    { key: 'shippingCharge', value: 60 },
    { key: 'freeShippingAbove', value: 999 },
    { key: 'deliveryEstimate', value: '5-7 business days' },
    { key: 'razorpayEnabled', value: true },
    { key: 'codEnabled', value: true },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Settings.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user — pass plain text, pre('save') hook will hash it
        const admin = await User.create({
            name: 'Aayush Singhavi',
            email: process.env.ADMIN_EMAIL || 'aayushsinghavi@gmail.com',
            password: process.env.ADMIN_PASSWORD || 'Aayush123',
            role: 'admin',
            isVerified: true,
            phone: '9822843015',
        });
        console.log(`👤 Admin created: ${admin.email}`);
        console.log(`🔑 Admin password: ${process.env.ADMIN_PASSWORD || 'Aayush123'}`);

        // Create products
        const createdProducts = await Product.insertMany(products);
        console.log(`📦 ${createdProducts.length} products created`);

        // Create settings
        await Settings.insertMany(settings);
        console.log('⚙️  Settings initialized');

        // Create blogs
        const Blog = require('../models/Blog.model');
        await Blog.deleteMany({});

        const blogs = [
            {
                title: 'The Advanced Science Behind Grounding Therapy',
                slug: 'the-advanced-science-behind-grounding-therapy',
                content: `
                    <p class="lead">Grounding, also known as earthing, refers to contact with the Earth's surface electrons by walking barefoot outside or sitting, working, or sleeping indoors connected to conductive systems.</p>
                    <p>Research shows that direct physical contact with the vast supply of electrons on the surface of the Earth promotes a significant sense of well-being and health. Modern lifestyles have increasingly separated humans from the primordial flow of Earth's electrons.</p>
                    <h3>How Our Earth Therapy Belt Restores Balance</h3>
                    <p>Our Earth Therapy Belt brings this scientific healing directly into your living room. By utilizing medical-grade conductive threads, it allows you to absorb the earth's natural energy while working at your desk or sleeping, significantly lowering cortisol levels and neutralizing free radicals.</p>
                    <blockquote>"Grounding is the most profound health discovery of the 21st century."</blockquote>
                `,
                excerpt: 'Discover how connecting with the Earth’s natural electrical charge can reduce inflammation, improve sleep, and neutralize free radicals.',
                coverImage: { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200', publicId: 'blog_1' },
                author: admin._id,
                tags: ['Grounding', 'Wellness', 'Science'],
                isPublished: true,
                views: 3250
            },
            {
                title: '5 Ways Hydrotherapy Can Accelerate Muscle Recovery',
                slug: '5-ways-hydrotherapy-can-accelerate-muscle-recovery',
                content: `
                    <p class="lead">Water has been used as a healing tool for centuries. Modern hydrotherapy, particularly with tools like our GRAD Tub, uses the physical properties of water—such as temperature and pressure—to stimulate blood circulation and treat symptoms of certain diseases.</p>
                    <h3>The Gradient Aqua Dynamics Advantage</h3>
                    <p>Our GRAD (Gradient Aqua Dynamics) Tub provides targeted pressure across different muscle groups. Here are 5 ways it accelerates recovery:</p>
                    <ul>
                        <li><strong>Vasodilation:</strong> Warm water expands blood vessels, rushing oxygen-rich blood to depleted muscles.</li>
                        <li><strong>Hydrostatic Pressure:</strong> The physical weight of the water reduces swelling and joint inflammation.</li>
                        <li><strong>Buoyancy:</strong> Relieves joint stress by reducing the effects of gravity by up to 90%.</li>
                        <li><strong>Myofascial Release:</strong> The targeted jets act as a deep tissue massage.</li>
                        <li><strong>Endorphin Release:</strong> The soothing heat triggers the brain's natural pain relievers.</li>
                    </ul>
                    <p>Start your advanced hydrotherapy journey today with AMT.</p>
                `,
                excerpt: 'Learn the ancient secrets of water healing and how our new GRAD Tub technology maximizes these benefits for athletes and rehabilitation.',
                coverImage: { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200', publicId: 'blog_2' },
                author: admin._id,
                tags: ['Hydrotherapy', 'Recovery', 'Fitness'],
                isPublished: true,
                views: 2840
            },
            {
                title: 'Understanding Zero Volt Therapy in a Hyper-Connected World',
                slug: 'understanding-zero-volt-therapy',
                content: `
                    <p class="lead">Electromagnetic fields (EMFs) are everywhere in our modern lives—from WiFi routers and microwaves to smartphones and bluetooth headphones. Zero Volt Therapy aims to neutralize the ambient static electricity stored in the human body.</p>
                    <h3>The Invisible Burden of Static Charge</h3>
                    <p>Modern humans accumulate static voltage throughout the day. This invisible electric tension can lead to chronic fatigue, poor sleep quality, and a hyperactive nervous system.</p>
                    <p>By draining these excess charges, our <strong>Zero Volt Protocol</strong> helps calm the central nervous system and creates an optimal electrical environment for cellular regeneration. This therapy essentially grounds your body's electrical potential back to zero—the same potential as the Earth.</p>
                `,
                excerpt: 'Are modern electronics making you sick? What you need to know about static buildup, EMFs, and neutralizing your body voltage.',
                coverImage: { url: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=1200', publicId: 'blog_3' },
                author: admin._id,
                tags: ['Zero Volt', 'EMF', 'Health'],
                isPublished: true,
                views: 4100
            },
            {
                title: 'The Vital Role of Structured Water in Cellular Hydration',
                slug: 'vital-role-of-structured-water-in-cellular-hydration',
                content: `
                    <p class="lead">Not all water is created equal. While tap and bottled water provide basic hydration, 'structured water' represents a state of water where the molecules form a hexagonal cluster, similar to the water naturally found in untouched mountain springs.</p>
                    <h3>Why Structured Water Matters</h3>
                    <p>Our <strong>Smart Living Water</strong> system uses bio-resonance technology to restore water's natural crystalline structure. This allows water molecules to enter human cells far more easily than unstructured "bulk" water.</p>
                    <p>The benefits include enhanced nutrient absorption, superior toxin flushing, and increased energy levels. When you hydrate with structured water, you are drinking water the way nature intended.</p>
                `,
                excerpt: 'Not all water hydrates equally. Uncover the science between bulk water and crystalline structured water for optimal cellular health.',
                coverImage: { url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1200', publicId: 'blog_4' },
                author: admin._id,
                tags: ['Hydration', 'Water', 'Bio-hacks'],
                isPublished: true,
                views: 1850
            },
            {
                title: 'Rehabilitating Calf Muscles After Sporting Injuries',
                slug: 'rehabilitating-calf-muscles-after-sporting-injuries',
                content: `
                    <p class="lead">The calf muscle is notoriously difficult to rehabilitate due to the constant load it bears during daily activities. Whether you're an elite athlete or a weekend warrior, a calf tear can sideline you for months.</p>
                    <h3>Targeted Pressure Therapy</h3>
                    <p>The <strong>Calf Muscle Push-up</strong> device isolates the gastrocnemius and soleus muscles, providing vibrating pressure therapy that breaks down scar tissue while stimulating blood flow.</p>
                    <p>When combined with proper stretching protocols, this targeted mechanical stimulation cuts recovery time by almost 40% according to our latest clinical trials.</p>
                `,
                excerpt: 'A comprehensive guide on rebuilding strength and elasticity in the lower leg using targeted pressure technology.',
                coverImage: { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200', publicId: 'blog_5' },
                author: admin._id,
                tags: ['Rehabilitation', 'Muscles', 'Sports'],
                isPublished: true,
                views: 2200
            },
            {
                title: 'Hot Water VASO Stimulation: A Heart-Healthy Practice',
                slug: 'hot-water-vaso-stimulation-heart-healthy-practice',
                content: `
                    <p class="lead">Cardiovascular health isn't just about cardio workouts. Passive heating through targeted hot water therapy offers remarkable benefits for arterial health and blood pressure regulation.</p>
                    <h3>The Thermoregulatory Response</h3>
                    <p>Our <strong>Hot Water VASO Stimulation</strong> system applies precise 40°C heat to target zones. This artificial fever response forces blood vessels to dilate (vasodilation), dramatically decreasing vascular resistance.</p>
                    <p>Consistent use mimics the cardiovascular benefits of mild aerobic exercise, making it an incredible therapy tool for those with restricted mobility or those looking to boost their resting cardiovascular efficiency.</p>
                `,
                excerpt: 'How passive heating through precision hydro-technology can lower blood pressure and improve arterial flexibility.',
                coverImage: { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200', publicId: 'blog_6' },
                author: admin._id,
                tags: ['Cardiovascular', 'Heat Therapy', 'Healing'],
                isPublished: true,
                views: 3100
            }
        ];

        const createdBlogs = await Blog.insertMany(blogs);
        console.log(`📝 ${createdBlogs.length} blogs created`);

        console.log('\n✅ Database seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Admin Email:    ${admin.email}`);
        console.log(`Admin Password: ${process.env.ADMIN_PASSWORD || 'Aayush123#@'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
};

seed();
