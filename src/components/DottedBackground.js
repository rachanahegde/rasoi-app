import React from 'react';

const DottedBackground = () => (
    <style>{`
    .bg-dot-pattern {
      background-color: #FDFCF8;
      background-image: radial-gradient(#D6D3D1 1.5px, transparent 1.5px);
      background-size: 24px 24px;
    }
    .font-serif-custom {
      font-family: 'Georgia', 'Cambria', 'Times New Roman', serif;
    }
    .notebook-shadow {
      box-shadow: 3px 3px 0px 0px #E7E5E4; 
    }
    .paper-card {
      background: #FFFFFF;
      border: 1px solid #E7E5E4;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .handwritten-underline {
      background-image: linear-gradient(to right, #E7E5E4 50%, transparent 50%);
      background-position: bottom;
      background-size: 10px 1px;
      background-repeat: repeat-x;
    }
  `}</style>
);

export default DottedBackground;
