
import React, { useState, useEffect } from 'react';
import { Crop } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';

const CropLibraryView: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  
  useEffect(() => {
    fetch('data/cropLibrary.json')
      .then(res => res.json())
      .then(data => setCrops(data as Crop[]))
      .catch(error => console.error("Failed to fetch crop library:", error));
  }, []);

  const primaryCategories = ['All', ...[...new Set(crops.map(m => m.primaryCategory))].sort()];
  const subCategories = ['All', ...[...new Set(
      crops
        .filter(c => selectedPrimaryCategory === 'All' || c.primaryCategory === selectedPrimaryCategory)
        .map(m => m.subCategory)
    )].sort()];

  const filteredCrops = crops.filter(crop => {
    const matchesPrimaryCategory = selectedPrimaryCategory === 'All' || crop.primaryCategory === selectedPrimaryCategory;
    const matchesSubCategory = selectedSubCategory === 'All' || crop.subCategory === selectedSubCategory;
    const matchesSearch = crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          crop.variety.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPrimaryCategory && matchesSubCategory && matchesSearch;
  });

  useEffect(() => {
      setSelectedSubCategory('All');
  }, [selectedPrimaryCategory]);

  return (
    <div className="animate-fade-in theme-flavour">
      <h2 className="text-3xl font-bold text-gray-100 mb-2 font-display uppercase">Master Crop Library</h2>
      <p className="text-gray-400 mb-8">A master database of crops, categorized by nature and growth system, for yield planning and sourcing.</p>
      
      <GlassmorphicCard className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">Search Crop or Variety</label>
            <input 
              type="text" 
              placeholder="e.g., Arugula, Red Russian..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" 
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">Primary Category</label>
            <select 
              value={selectedPrimaryCategory} 
              onChange={(e) => setSelectedPrimaryCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              {primaryCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
           <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">Sub Category</label>
            <select 
              value={selectedSubCategory} 
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              disabled={selectedPrimaryCategory === 'All' && subCategories.length <= 1}
            >
              {subCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </GlassmorphicCard>

      <GlassmorphicCard className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-indigo-300 uppercase bg-slate-900 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">Primary Category</th>
              <th scope="col" className="px-6 py-3">Sub Category</th>
              <th scope="col" className="px-6 py-3">Crop Name</th>
              <th scope="col" className="px-6 py-3">Variety / Type</th>
              <th scope="col" className="px-6 py-3">Edible Part</th>
              <th scope="col" className="px-6 py-3">Growth System</th>
            </tr>
          </thead>
          <tbody>
            {filteredCrops.map((crop, index) => (
              <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/60">
                <td className="px-6 py-4 font-mono text-xs">{crop.primaryCategory}</td>
                <td className="px-6 py-4 font-mono text-xs">{crop.subCategory}</td>
                <th scope="row" className="px-6 py-4 font-semibold text-gray-200 whitespace-nowrap">{crop.cropName}</th>
                <td className="px-6 py-4">{crop.variety}</td>
                <td className="px-6 py-4">{crop.ediblePart}</td>
                <td className="px-6 py-4 text-gray-500">{crop.growthSystem}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCrops.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p className="font-semibold">No crops found</p>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default CropLibraryView;
