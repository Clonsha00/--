import React from 'react';

/* 
  Pixel Art Border Logic:
  We can simulate pixel borders using box-shadows or border-image.
  Here we use a clean CSS box-shadow approach for the "jagged" look if we want,
  but for simplicity and performance in React, we'll use solid borders with sharp radius
  styled to look blocky, or actual box-shadow hacks.
  
  Let's use the 'box-shadow' NES.css style approach for true pixel feel.
*/

const pixelBoxShadow = (color) => `
  -2px -2px 0 0 ${color},
  2px -2px 0 0 ${color},
  -2px 2px 0 0 ${color},
  2px 2px 0 0 ${color},
  -4px 0 0 0 ${color},
  4px 0 0 0 ${color},
  0 -4px 0 0 ${color},
  0 4px 0 0 ${color}
`;

export const PixelButton = ({ children, onClick, variant = 'primary', style = {} }) => {
  const color = variant === 'primary' ? 'var(--primary-neon)' :
    variant === 'danger' ? 'var(--accent-neon)' : 'var(--secondary-neon)';

  const buttonStyle = {
    fontFamily: 'var(--font-pixel)',
    backgroundColor: 'transparent',
    color: color,
    border: 'none',
    padding: '12px 16px',
    margin: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    position: 'relative',
    boxShadow: pixelBoxShadow(color),
    transition: 'transform 0.1s',
    ...style
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
      onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  );
};

export const PixelInput = ({ value, onChange, placeholder, type = "text", style = {}, ...props }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
      style={{
        fontFamily: 'var(--font-pixel)',
        backgroundColor: 'var(--card-bg)',
        color: 'white',
        border: '4px solid #333',
        padding: '10px',
        margin: '8px 0',
        width: '100%',
        outline: 'none',
        fontSize: '0.8rem',
        ...style
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--secondary-neon)'}
      onBlur={(e) => e.target.style.borderColor = '#333'}
    />
  );
};

export const PixelCard = ({ children, style = {} }) => {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      padding: '20px',
      margin: '10px',
      boxShadow: pixelBoxShadow('#333'),
      position: 'relative',
      ...style
    }}>
      {children}
    </div>
  );
};
