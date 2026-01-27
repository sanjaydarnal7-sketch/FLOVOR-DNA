
import React, { useState, useEffect } from 'react';
import { RawMaterial } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';

const RawMaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  useEffect(() => {
    fetch('data/rawMaterials.json')
      .then(res => res.json())
      .then(data => setMaterials(data as RawMaterial[]))
      .catch(error => console.error("Failed to fetch raw materials:", error));
  }, []);

  const categories = ['All', ...[...new Set(materials.map(m => m.category))].sort()];

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'All' || material.category === selectedCategory;
    const matchesSearch = material.ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.primaryFunction.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in theme-flavour">
      <h2 className="text-3xl font-bold text-gray-100 mb-2 font-display uppercase">Raw Materials Guide</h2>
      <p className="text-gray-400 mb-8">A comprehensive database for sourcing, function, and application of R&D materials.</p>
      
      <GlassmorphicCard className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">Search</label>
            <input 
              type="text" 
              placeholder="Search by ingredient, function, or notes..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" 
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </GlassmorphicCard>

      <GlassmorphicCard className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-indigo-300 uppercase bg-slate-900 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Ingredient</th>
              <th scope="col" className="px-6 py-3">Primary Function</th>
              <th scope="col" className="px-6 py-3">Secondary Function</th>
              <th scope="col" className="px-6 py-3">Storage</th>
              <th scope="col" className="px-6 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map(material => (
              <tr key={material.id} className="border-b border-slate-800 hover:bg-slate-800/60">
                <td className="px-6 py-4 font-mono text-xs">{material.category}</td>
                <th scope="row" className="px-6 py-4 font-semibold text-gray-200 whitespace-nowrap">{material.ingredient}</th>
                <td className="px-6 py-4">{material.primaryFunction}</td>
                <td className="px-6 py-4">{material.secondaryFunction}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${material.storage === 'Chilled' ? 'bg-blue-900/50 text-blue-300' : 'bg-amber-900/50 text-amber-300'}`}>
                        {material.storage}
                    </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{material.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMaterials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p className="font-semibold">No materials found</p>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default RawMaterialsView;
