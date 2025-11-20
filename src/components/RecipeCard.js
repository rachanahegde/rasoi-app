import React from 'react';
import { Heart } from 'lucide-react';

const RecipeCard = ({ recipe, onClick, onToggleFav }) => (
    <div
        onClick={onClick}
        className="group bg-white rounded-xl border border-stone-200 p-3 pb-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
    >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 bg-stone-50/10 pointer-events-none"></div>

        <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg border border-stone-100">
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sepia-[.2] group-hover:sepia-0" />

            {/* Sticker Tag */}
            <div className="absolute bottom-2 left-2 bg-[#FFFDF5] px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-stone-200 shadow-sm text-stone-600">
                {recipe.time}
            </div>

            <button
                onClick={(e) => onToggleFav(e, recipe.id)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:bg-red-50 transition-colors"
            >
                <Heart className={`w-4 h-4 ${recipe.favorite ? 'fill-red-400 text-red-400' : 'text-stone-300'}`} />
            </button>
        </div>

        <div className="px-2">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-serif-custom font-bold text-lg leading-snug text-stone-800 line-clamp-2">{recipe.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {recipe.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-1 rounded-sm border border-stone-200/50">{tag}</span>
                ))}
            </div>
        </div>
    </div>
);

export default RecipeCard;
