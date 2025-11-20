import React from 'react';

const NavItem = ({ icon: Icon, active, onClick, highlight, label }) => (
    <button
        onClick={onClick}
        className={`
      w-full aspect-square flex flex-col gap-1 items-center justify-center rounded-lg transition-all duration-300
      ${active ? 'bg-white text-stone-800 shadow-sm scale-105 border border-stone-200' : 'text-stone-400 hover:bg-stone-100/50 hover:text-stone-600'}
      ${highlight && !active ? 'bg-stone-200 text-stone-700 hover:bg-stone-300 shadow-inner' : ''}
    `}
        title={label}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-stone-800' : ''} ${highlight && !active ? 'text-stone-700' : ''}`} />
    </button>
);

export default NavItem;
