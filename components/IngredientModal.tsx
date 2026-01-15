
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Ingredient, IngredientDNA } from '../types';
import GlassmorphicCard from './ui/GlassmorphicCard';
import SciFiSlider from './ui/SciFiSlider';

interface IngredientModalProps {
  ingredient: Ingredient | null;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
}

const emptyDNA: IngredientDNA = {
    acids: 5,
    sugars: 5,
    bitterness: 2,
    aromatics: 5,
    aldehydes: 5,
    esters: 5,
    umami: 2,
    texture: 5,
    water_content: 5,
};

const emptyIngredient: Omit<Ingredient, 'id'> = {
    name: '',
    type: 'fruit',
    subcategory: '',
    archetype: '',
    notes: '',
    origin: '',
    seasonality: '',
    state: 'fresh',
    dna: emptyDNA,
};

const IngredientModal: React.FC<IngredientModalProps> = ({ ingredient, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Ingredient, 'id'>>(() => ingredient ? { ...ingredient } : emptyIngredient);
  const isEditing = !!(ingredient && ingredient.id);

  useEffect(() => {
    setFormData(ingredient ? { ...ingredient } : emptyIngredient);
  }, [ingredient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDnaSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        dna: {
            ...prev.dna,
            [name]: Number(value)
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        alert("Ingredient Name is required.");
        return;
    }
    const finalIngredient: Ingredient = {
        ...formData,
        id: isEditing && ingredient ? ingredient.id : uuidv4(),
    };
    onSave(finalIngredient);
  };
  
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <GlassmorphicCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={handleModalContentClick}>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">{isEditing ? 'Edit Ingredient DNA' : 'Add New Ingredient'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-indigo-300">Primary Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Ingredient Name" required className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <input name="type" value={formData.type} onChange={handleInputChange} placeholder="Type (e.g., fruit, vegetable)" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <input name="subcategory" value={formData.subcategory} onChange={handleInputChange} placeholder="Subcategory (e.g., citrus)" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <input name="archetype" value={formData.archetype} onChange={handleInputChange} placeholder="Archetype (e.g., Citrus Zest)" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                 <input name="origin" value={formData.origin} onChange={handleInputChange} placeholder="Origin (e.g., India)" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <input name="seasonality" value={formData.seasonality} onChange={handleInputChange} placeholder="Seasonality (e.g., Summer)" className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
               <h3 className="font-semibold text-indigo-300">Flavour DNA Profile</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 p-4 bg-slate-900/40 rounded-lg border border-slate-800/50">
                    <SciFiSlider label="Acids" name="acids" value={formData.dna.acids} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Sugars" name="sugars" value={formData.dna.sugars} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Bitterness" name="bitterness" value={formData.dna.bitterness} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Aromatics" name="aromatics" value={formData.dna.aromatics} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Aldehydes" name="aldehydes" value={formData.dna.aldehydes} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Esters" name="esters" value={formData.dna.esters} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Umami" name="umami" value={formData.dna.umami} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Texture" name="texture" value={formData.dna.texture} min={0} max={10} onChange={handleDnaSliderChange} />
                    <SciFiSlider label="Water Content" name="water_content" value={formData.dna.water_content} min={0} max={10} onChange={handleDnaSliderChange} />
               </div>
            </div>

            <div className="md:col-span-2">
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Sensory notes..." rows={3} className="w-full bg-slate-800/60 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
             <button type="button" onClick={onClose} className="border border-slate-700 text-gray-400 font-semibold py-2 px-6 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">Cancel</button>
             <button type="submit" className="bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 font-bold py-2 px-6 rounded-lg hover:bg-indigo-500/20 transition-colors animate-subtle-glow-indigo">Save Ingredient</button>
          </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default IngredientModal;