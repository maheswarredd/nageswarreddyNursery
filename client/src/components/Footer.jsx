import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Truck, Droplets, Sun, Download } from 'lucide-react';

const Footer = () => {
  const triggerPwaInstall = () => {
    alert('To install Nageswarreddy Nursery Plants on your device:\n\n• On Chrome/Edge: Click the install icon in the address bar.\n• On iOS Safari: Tap "Share" and select "Add to Home Screen".');
  };

  return (
    <footer className="bg-forest-950 text-gray-300 pt-16 pb-8 border-t border-forest-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-forest-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-forest-900/80 flex items-center justify-center text-forest-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Moisture-Safe Transit</h4>
              <p className="text-xs text-gray-400">Ventilated crates with root gel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-forest-900/80 flex items-center justify-center text-forest-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Disease Free</h4>
              <p className="text-xs text-gray-400">Hardened living nursery plants</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-forest-900/80 flex items-center justify-center text-forest-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Direct Nursery Rates</h4>
              <p className="text-xs text-gray-400">No middlemen, fair farmer prices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-forest-900/80 flex items-center justify-center text-forest-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Expert Plant Advice</h4>
              <p className="text-xs text-gray-400">Lifetime botanical assistance</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold font-heading text-white">Nageswarreddy</span>
                <span className="text-xs uppercase font-bold tracking-widest text-forest-400 block">Nursery Plants</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              We specialize entirely in necessary, useful, and health-enriching living plants for every Indian home. From sacred Tulsi and air-cleansing Snake Plants to grafted Banganapalli Mango trees and kitchen curry leaves.
            </p>
            <button
              onClick={triggerPwaInstall}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-forest-900 hover:bg-forest-800 text-forest-200 text-xs font-semibold rounded-lg border border-forest-700/60 transition"
            >
              <Download className="w-4 h-4 text-forest-400" />
              Install Nageswarreddy App (PWA)
            </button>
          </div>

          {/* Necessary Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Plant Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/shop?category=indoor-plants" className="hover:text-forest-400 transition">Indoor Air Purifiers</Link></li>
              <li><Link to="/shop?category=fruit-plants" className="hover:text-forest-400 transition">Fruit-Yielding Trees</Link></li>
              <li><Link to="/shop?category=flowering-plants" className="hover:text-forest-400 transition">Flowering & Fragrant</Link></li>
              <li><Link to="/shop?category=medicinal-plants" className="hover:text-forest-400 transition">Ayurvedic Medicinal</Link></li>
              <li><Link to="/shop?category=vegetable-plants" className="hover:text-forest-400 transition">Kitchen Vegetables</Link></li>
              <li><Link to="/shop?category=succulents-cactus" className="hover:text-forest-400 transition">Low-Water Succulents</Link></li>
            </ul>
          </div>

          {/* Quick Support Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/care-guide" className="hover:text-forest-400 transition">Plant Care Guides</Link></li>
              <li><Link to="/orders" className="hover:text-forest-400 transition">Track Your Order</Link></li>
              <li><Link to="/support" className="hover:text-forest-400 transition">Submit Support Query</Link></li>
              <li><Link to="/wishlist" className="hover:text-forest-400 transition">My Plant Wishlist</Link></li>
              <li><Link to="/shop?availability=soldout" className="hover:text-forest-400 transition">Back-In-Stock Request</Link></li>
            </ul>
          </div>

          {/* Nursery Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Nursery Desk</h4>
            <div className="flex items-start gap-2.5 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-forest-400 flex-shrink-0 mt-1" />
              <span>Nageswarreddy Green Farms & Nursery, NH-40, Kadapa, Andhra Pradesh 516001, India</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <Phone className="w-4 h-4 text-forest-400 flex-shrink-0" />
              <a href="tel:+919490123456" className="hover:text-white transition">+91 94901 23456</a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <Mail className="w-4 h-4 text-forest-400 flex-shrink-0" />
              <a href="mailto:support@nageswarreddyplants.com" className="hover:text-white transition">support@nageswarreddyplants.com</a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-forest-900/60 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Nageswarreddy Nursery Plants. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Online UPI & Cash on Delivery Accepted</span>
            <span>•</span>
            <span>Production MERN Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
