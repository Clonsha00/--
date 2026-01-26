import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";

// Define custom styling for the datepicker to match Pixel Neon theme
// We will inject a style tag or we could use a separate CSS file. 
// For encapsulation ease here, we use a style tag.

const customDatePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker {
    font-family: 'Press Start 2P', cursive;
    background-color: var(--card-bg);
    border: 4px solid var(--primary-neon);
    border-radius: 0;
    box-shadow: 
      -4px 0 0 0 #000,
      4px 0 0 0 #000,
      0 -4px 0 0 #000,
      0 4px 0 0 #000,
      0 0 0 4px var(--primary-neon); /* Double border effect */
    color: #fff;
  }
  
  .react-datepicker__header {
    background-color: #000;
    border-bottom: 4px solid var(--primary-neon);
  }
  
  .react-datepicker__current-month, 
  .react-datepicker-time__header, 
  .react-datepicker-year-header {
    color: var(--secondary-neon);
    font-size: 0.8rem;
    padding: 10px 0;
  }

  .react-datepicker__day-names {
    display: flex;
    justify-content: space-around;
    background-color: #000;
  }

  .react-datepicker__day-name {
    color: var(--primary-neon);
    font-size: 0.6rem;
    width: 1.7rem;
    line-height: 1.7rem;
    margin: 0.2rem;
  }
  
  .react-datepicker__day {
    color: #fff;
    font-size: 0.7rem;
    border-radius: 0;
    margin: 0.2rem;
  }
  
  .react-datepicker__day:hover {
    background-color: var(--secondary-neon);
    color: #000;
    border-radius: 0;
  }
  
  .react-datepicker__day--selected, 
  .react-datepicker__day--keyboard-selected {
    background-color: var(--primary-neon);
    color: #000;
    border-radius: 0;
    box-shadow: 2px 2px 0 0 #000;
  }
  
  .react-datepicker__time-container {
    border-left: 4px solid var(--primary-neon);
    background-color: var(--card-bg);
  }
  
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
    padding: 10px;
    height: auto;
    color: #888; /* Dim color for unselected times */
  }
  
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
    background-color: var(--secondary-neon);
    color: #000;
  }
  
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
     background-color: var(--primary-neon) !important;
     color: #000 !important;
     font-weight: bold;
     box-shadow: 2px 2px 0 0 #fff;
  }

  /* Triangle pointer removal/customization */
  .react-datepicker__triangle {
    display: none;
  }

  /* Navigation arrow customization */
  .react-datepicker__navigation-icon::before {
    border-color: var(--primary-neon);
    border-width: 3px 3px 0 0;
  }
`;

export const PixelDatePicker = ({ selected, onChange, placeholder }) => {
  return (
    <>
      <style>{customDatePickerStyles}</style>
      <div style={{ position: 'relative', width: '100%' }}>
        <DatePicker
          selected={selected}
          onChange={onChange}
          showTimeSelect
          timeFormat="HH:mm"
          dateFormat="yyyy/MM/dd HH:mm"
          placeholderText={placeholder || "SELECT DATE..."}
          customInput={
            <input
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
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--secondary-neon)'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          }
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 10],
              },
            },
          ]}
        />
      </div>
    </>
  );
};
