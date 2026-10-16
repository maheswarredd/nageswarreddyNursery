import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Droplets, 
  Sun, 
  Heart, 
  Star, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  PhoneCall,
  Clock,
  Layers
} from 'lucide-react';
import api from '../utils/api';
import PlantCard from '../components/PlantCard';
import { PlantCardSkeleton } from '../components/LoadingSkeleton';

const categoryIcons = {
  'indoor-plants': '🏠',
  'outdoor-plants': '☀️',
  'flowering-plants': '🌸',
  'fruit-plants': '🥭',
  'medicinal-plants': '🌿',
  'vegetable-plants': '🌱',
  'ornamental-plants': '🎨',
  'succulents-cactus': '🌵',
  'herbs': '🍃',
  'native-plants': '🌴',
  'balcony-plants': '🪴'
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredPlants, setFeaturedPlants] = useState([]);
  const [popularPlants, setPopularPlants] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, featRes, popRes, newRes] = await Promise.all([
          api.get('/categories'),
          api.get('/plants?featured=true&limit=8'),
          api.get('/plants?popular=true&limit=8'),
          api.get('/plants?newArrival=true&limit=8')
        ]);

        setCategories(catRes.data.categories || []);
        setFeaturedPlants(featRes.data.plants || []);
        setPopularPlants(popRes.data.plants || []);
        setNewArrivals(newRes.data.plants || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-50 via-white to-forest-50/30 pt-8 pb-16 lg:py-24 border-b border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                <span>Nageswarreddy Nursery Plants • Direct Farm Nursery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-forest-950 tracking-tight leading-[1.15]">
                Living Greens, Pure Air, <br />
                <span className="text-forest-700 italic">Nursery Plants</span> For Every Home.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Hand-nurtured, pest-free, air-purifying indoor plants, sacred Ayurvedic herbs, grafted Banganapalli mango trees, fragrant Desi roses, and daily kitchen garden greens delivered safely in moisture-gel protective packaging across India.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-2xl shadow-lg shadow-forest-800/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base group"
                >
                  <span>Explore Plant Catalog</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/shop?availability=available"
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-forest-50 text-forest-800 font-bold rounded-2xl border border-forest-200 shadow-sm transition flex items-center justify-center gap-2 text-base"
                >
                  <Sprout className="w-5 h-5 text-forest-600" />
                  <span>Available In Stock Now</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-forest-100/80 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-forest-900 font-heading">40+</div>
                  <div className="text-xs text-gray-500 font-medium">Essential Varieties</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-forest-900 font-heading">100%</div>
                  <div className="text-xs text-gray-500 font-medium">Root-Safe Arrival</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-forest-900 font-heading">₹0</div>
                  <div className="text-xs text-gray-500 font-medium">Delivery over ₹499</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-forest-900 aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80"
                    alt="Nageswarreddy Plant Nursery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-black/10" />
                  
                  {/* Floating Highlight Card */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-forest-100 text-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase font-bold text-forest-700 tracking-wider">Top Recommendation</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">In Stock</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Air-Purifying Golden Pothos</h3>
                    <p className="text-xs text-gray-500 mt-0.5">NASA-approved indoor detoxifier • Tolerates low light</p>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-base font-black text-forest-900">₹229 <span className="text-xs text-gray-400 line-through">₹299</span></span>
                      <Link to="/plant/money-plant-golden-pothos" className="text-xs font-bold text-forest-700 hover:underline">
                        Order Now →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-forest-700">Browse By Category</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-forest-950 mt-1">
              Nursery Plants For Every Space
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1 mt-2 md:mt-0">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group p-4 bg-white rounded-2xl border border-forest-100/90 shadow-sm hover:shadow-md hover:border-forest-300 hover:bg-forest-50/40 transition-all text-center flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-forest-100/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3 shadow-inner">
                {categoryIcons[cat.slug] || '🌿'}
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-forest-800 transition line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {cat.plantCount || 4} Varieties
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Nursery Plants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-xs font-bold mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Handpicked by Horticulturists</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-forest-950">
              Featured Nursery Plants
            </h2>
          </div>
          <Link to="/shop?featured=true" className="text-sm font-bold text-forest-700 hover:underline flex items-center gap-1 mt-2 sm:mt-0">
            See all featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <PlantCardSkeleton key={i} />)
          ) : (
            featuredPlants.map((plant) => <PlantCard key={plant._id} plant={plant} />)
          )}
        </div>
      </section>

      {/* Popular Home Staples */}
      <section className="bg-forest-50/50 py-16 border-y border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-forest-700">Most Loved By Customers</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-forest-950 mt-1">
                Popular Daily Plants
              </h2>
            </div>
            <Link to="/shop?popular=true" className="text-sm font-bold text-forest-700 hover:underline flex items-center gap-1 mt-2 sm:mt-0">
              View all popular <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <PlantCardSkeleton key={i} />)
            ) : (
              popularPlants.map((plant) => <PlantCard key={plant._id} plant={plant} />)
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-forest-100 text-forest-800 rounded-md text-xs font-bold mb-1">
              <Sprout className="w-3.5 h-3.5 text-forest-700" />
              <span>Fresh Nursery Harvest</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-forest-950">
              New Arrivals & Special Batches
            </h2>
          </div>
          <Link to="/shop?newArrival=true" className="text-sm font-bold text-forest-700 hover:underline flex items-center gap-1 mt-2 sm:mt-0">
            View new arrivals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <PlantCardSkeleton key={i} />)
          ) : (
            newArrivals.map((plant) => <PlantCard key={plant._id} plant={plant} />)
          )}
        </div>
      </section>

      {/* Plant Care & Guarantee Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-300">
              Living Plant Care & Transit Guarantee
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading leading-tight">
              How We Ensure Your Plants Arrive Alive, Hydrated & Ready to Thrive.
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Every sapling from Nageswarreddy Nursery Plants undergoes a 48-hour hardening routine. Root balls are enveloped in organic moisture retention gel and secured in rigid ventilated boxes designed to absorb transit impacts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-forest-100">
                <CheckCircle2 className="w-5 h-5 text-forest-400 flex-shrink-0" />
                <span>Moisture gel root protection</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-forest-100">
                <CheckCircle2 className="w-5 h-5 text-forest-400 flex-shrink-0" />
                <span>Multi-layer ventilated boxing</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-forest-100">
                <CheckCircle2 className="w-5 h-5 text-forest-400 flex-shrink-0" />
                <span>Unboxing & potting instructions</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-forest-100">
                <CheckCircle2 className="w-5 h-5 text-forest-400 flex-shrink-0" />
                <span>Lifetime botanical advice hotline</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/care-guide"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-forest-950 font-bold rounded-xl hover:bg-forest-50 transition text-sm shadow-md"
              >
                <span>Read Complete Plant Care Guide</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-forest-700">Verified Plant Buyers</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-forest-950 mt-1">
            Real Stories From Indian Home Gardeners
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Reviews are allowed exclusively after customers have received a DELIVERED order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-forest-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "The Banganapalli Mango sapling arrived with lush green foliage and perfectly damp soil. The graft is very clean and sturdy. Outstanding nursery quality!"
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-900">Dr. K. S. Rao</p>
                <p className="text-gray-400">Guntur, Andhra Pradesh</p>
              </div>
              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-forest-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "Ordered Snake Plant and Peace Lily for my apartment. Both plants are vibrant and had zero broken leaves. UPI payment verification was quick and straightforward."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-900">Ananya Sharma</p>
                <p className="text-gray-400">Bengaluru, Karnataka</p>
              </div>
              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-forest-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "Sacred Tulsi and Curry Leaf plants are thriving on my terrace. Smells so fragrant every morning! Very prompt customer service when I asked for watering tips."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-900">Venkata Ramana</p>
                <p className="text-gray-400">Hyderabad, Telangana</p>
              </div>
              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-forest-700">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-forest-950 mt-1">
            Questions About Plant Orders & Delivery
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              How do you keep live plants alive during courier transit?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              We water plants 24 hours prior to packaging and wrap the root ball in moisture-locking organic gel and breathable biodegradable wrap. The plants are held securely inside rigid, ventilated corrugated boxes to ensure leaves and stems do not break during transit.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              How does the Online UPI Payment and UTR verification work?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              When you select UPI at checkout, you will see our official nursery UPI ID and a dynamic QR code pre-filled with your exact order amount. After making the payment through Google Pay, PhonePe, Paytm, or BHIM, you enter your payer name and the 12-digit UTR/transaction ID. Our nursery desk verifies this with our bank account before accepting your order.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              What should I do immediately after receiving my plants?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              Unbox your plants immediately. Place them in bright indirect shade (avoid harsh direct afternoon sunlight) and give them a gentle sip of water. Let them acclimate for 2-3 days before repotting or transplanting into ground soil.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              What happens if a plant is out of stock / sold out?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              When our greenhouse stock reaches 0, the plant is automatically flagged as SOLD OUT. You can add the plant to your wishlist, and our system will automatically notify you via push notification and email the instant our next fresh batch is ready for dispatch!
            </p>
          </div>
        </div>
      </section>

      {/* Nursery Desk Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-100/70 rounded-3xl p-8 sm:p-10 border border-forest-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-forest-950">
              Need Assistance Selecting The Right Plants?
            </h3>
            <p className="text-sm text-forest-800">
              Our resident nursery horticulturists are available to guide you on sunlight, soil, and potting requirements.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <a
              href="tel:+919490123456"
              className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Nursery: +91 94901 23456</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
