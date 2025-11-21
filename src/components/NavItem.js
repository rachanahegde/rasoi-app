import React from 'react';

const NavItem = ({ icon: Icon, active, onClick, highlight, label }) => (
    <button
        onClick={onClick}
        className={`
      w-full aspect-square flex flex-col gap-1 items-center justify-center rounded-lg transition-all duration-300
      ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm scale-105 border border-sidebar-border' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
      ${highlight && !active ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-inner' : ''}
    `}
        title={label}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-sidebar-primary-foreground' : ''} ${highlight && !active ? 'text-accent-foreground' : ''}`} />
    </button>
);

export default NavItem;
