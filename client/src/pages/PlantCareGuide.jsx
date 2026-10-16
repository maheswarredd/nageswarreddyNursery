import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  Sun, 
  Droplets, 
  Layers, 
  Bug, 
  PackageOpen, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

const PlantCareGuide = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
          Horticultural Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-forest-950">
          Essential Plant Care & Survival Guide
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Follow these time-tested guidelines curated by the head horticulturists at Nageswarreddy Nursery Plants nursery to keep your plants thriving for years.
        </p>
      </div>

      {/* Step 1: Unboxing Live Plants */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-forest-800">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center font-bold">
            1
          </div>
          <h2 className="text-xl font-bold font-heading text-gray-900">
            Immediate 24-Hour Post-Delivery Protocol
          </h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your live plant package was packed in a dark, moisture-controlled transit crate. When you open the package:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-gray-700">
          <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-100">
            <h4 className="font-bold text-forest-900 mb-1">1. Hydrate Gently</h4>
            <p>Give 100-200ml of clean room-temperature water around the base. Do not soak.</p>
          </div>
          <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-100">
            <h4 className="font-bold text-forest-900 mb-1">2. Indirect Shade</h4>
            <p>Keep in bright indirect shade for 48 hours. Strictly avoid scorching midday sun.</p>
          </div>
          <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-100">
            <h4 className="font-bold text-forest-900 mb-1">3. Hold Off Repotting</h4>
            <p>Allow roots to settle for 5-7 days before transplanting into new containers.</p>
          </div>
        </div>
      </div>

      {/* Soil, Water, Light */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Sunlight Management</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Indoor plants like <strong>ZZ Plant</strong> and <strong>Snake Plant</strong> thrive in filtered light or shade. Flowering and fruit trees like <strong>Desi Rose</strong> and <strong>Mango</strong> require 5-6 hours of direct sun to yield blooms and fruits.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">The "Finger Test" Watering</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Overwatering causes 80% of plant deaths in urban homes. Always insert your finger 1 inch into the soil. If it feels cool and damp, DO NOT water. Water only when dry.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Ideal Potting Mix</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            The nursery gold standard: <strong>40% Garden Red Soil</strong> + <strong>30% Organic Vermicompost</strong> + <strong>20% Coco Peat</strong> + <strong>10% Perlite/Sand</strong>. Ensures strong roots and zero stagnation.
          </p>
        </div>
      </div>

      {/* Troubleshooting Common Plant Issues */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold font-heading text-gray-900">
          Troubleshooting Common Symptoms
        </h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <span className="font-bold text-amber-950 text-sm block mb-1">🟡 Leaves Turning Yellow & Dropping:</span>
            <p className="text-amber-900 leading-relaxed">
              Usually indicates overwatering or poor container drainage. Check that pot drainage holes are not blocked. Allow the topsoil to dry before watering again.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <span className="font-bold text-rose-950 text-sm block mb-1">🟤 Brown Crispy Leaf Edges:</span>
            <p className="text-rose-900 leading-relaxed">
              Low indoor humidity or exposure to dry air conditioning drafts. Mist the leaves with water every 2-3 days or move away from direct AC vents.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-emerald-950 text-sm block mb-1">🌿 Natural Organic Pest Deterrent:</span>
            <p className="text-emerald-900 leading-relaxed">
              Mix 5ml cold-pressed Neem Oil with 3-4 drops of mild liquid soap in 1 litre of warm water. Spray thoroughly on both sides of leaves once every 15 days in the evening.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-2xl text-sm shadow-md transition"
        >
          <span>Find Nursery Plants For Your Home</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

export default PlantCareGuide;
