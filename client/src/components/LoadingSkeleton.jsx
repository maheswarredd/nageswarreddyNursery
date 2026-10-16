import React from 'react';

export const PlantCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="space-y-3 animate-pulse">
    <div className="h-10 bg-gray-100 rounded-xl" />
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="h-12 bg-gray-50 rounded-lg border border-gray-100" />
    ))}
  </div>
);
