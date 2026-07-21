import React, { useState } from "react";
import { Switch, IconButton, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NavbarDropdownSpan from "./NavbarDropdownSpan.jsx"
import "./NavigationBar.css"
import bike_accident_img from "../../public/accident_bike.png"


/**
 * Navigation bar component
 * 
 * Renders a navigation bar containing a button for each provided item.
 * 
 * @param {string[]} props.items - List of labels used to generate navigation buttons
 * @param {(item: string) => void} [props.onItemClick] - Optional callback fired when a button is clicked
 *
 * @example
 * <NavBar
 *   items={["Home", "About", "Contact"]}
 *   onItemClick={(item) => console.log(item)}
 * />
 */
export default function Navbar({sideBarButtonAction,
                                sideBarOpenVar,
                                filterBarButtonAction,
                                filterOpenVar,
                                dropdownValues,
                                dropdownLabels,
                                setDropdownVals,
                                themeSwitchVal,
                                setTheme}) {

  function toggleSideBarOpen() {
    sideBarButtonAction(!sideBarOpenVar)
  }

  //const [testBool, setTestBool] = useState(false);
  


  function toggleFilterOpen() {
    filterBarButtonAction(!filterOpenVar)
  }

  return(
    <nav className="mainNavBar">
      <span className="mainNavBarSpanLeft">
        <img 
          className="navBarLogo"
          src={bike_accident_img}
        />
        <IconButton 
          onClick={toggleSideBarOpen}
          className="navbarMenuBtn"
          aria-label="delete"
          size="large"
        >
          <MenuIcon fontSize="inherit"/>
        </IconButton>
        <Button
          onClick={toggleFilterOpen}
          variant={filterOpenVar ? "contained" : "outlined"}
        >
          Filter
        </Button>
        {
        //<NavbarDropdownSpan
        //  dropdownItemLabels={dropdownLabels}
        //  dropdownSelectedVals={dropdownValues}
        //  setSelectedVals={setDropdownVals}
        ///>
        }
      </span >
      <span className="mainNavBarSpanRight">
        <Switch
          className="themeSwitch"
          checked={themeSwitchVal === "dark"}
          onChange={setTheme}
        />
      </span>
    </nav>
  )
}