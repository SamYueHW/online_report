import { useState ,useEffect , useRef} from "react";
import "./dropdown.scss";

function Dropdown({ selected, setSelected, options }) {
    const [isActive, setIsActive] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsActive(false);
        }
      };
  
      document.addEventListener('click', handleOutsideClick);
  
      return () => {
        document.removeEventListener('click', handleOutsideClick);
      };
    }, []); 
  
    return (
      <div className="dropdown"ref={dropdownRef} >
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
                  setSelected('vs '+option);
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
