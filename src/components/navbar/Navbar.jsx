import React, { useContext } from "react";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import "./navbar.scss";
import Switch from "@mui/material/Switch";
import { DarkModeContext } from "../../context/darkModeContext";


const Navbar = () => {
    const { dispatch } = useContext(DarkModeContext);
  return (
    <div className='navbar'>
        <div className="navbarContainer">
            <div className="items">
                <div className="item">
                    <LanguageOutlinedIcon className="icon" />
                    <span>English</span>
                </div>
                <div className="item">
                    <Switch
                    style={{ color: "#210876" }}
                    className="icon"
                    // onClick={() => dispatch({ type: "TOGGLE" })}
                    />
                    <span>Theme</span>
                </div>
                
            </div>


        </div>
    </div>
  )
}

export default Navbar
