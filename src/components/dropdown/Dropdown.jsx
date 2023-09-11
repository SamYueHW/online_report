import { useState } from "react";
import "./dropdown.scss";

function Dropdown({ selected, setSelected, options }) {
    const [isActive, setIsActive] = useState(false);

  
    return (
      <div className="dropdown">
        <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
          {selected}
          <span className="material-icons-sharp">arrow_drop_down</span>
        </div>
        {isActive && (
          <div className="dropdown-content">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelected(option);
                  setIsActive(false);
                }}
                className="dropdown-item"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  

export default Dropdown;
