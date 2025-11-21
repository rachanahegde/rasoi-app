import React from 'react';

const DottedBackground = () => (
  <style>{`
    .bg-dot-pattern {
      background-color: var(--background);
      background-image: radial-gradient(var(--muted) 1.5px, transparent 1.5px);
      background-size: 24px 24px;
    }
    .notebook-shadow {
      box-shadow: 3px 3px 0px 0px var(--muted); 
    }
    .paper-card {
      background: var(--card);
      border: 1px solid var(--border);
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .handwritten-underline {
      background-image: linear-gradient(to right, var(--border) 50%, transparent 50%);
      background-position: bottom;
      background-size: 10px 1px;
      background-repeat: repeat-x;
    }
  `}</style>
);

export default DottedBackground;
