import useState from "react";
import Button from "@mui/material/Button";
import SubmenuDropdown from "./SubmenuDropdown";
import "./SideBarMenu.css";


function Sidebar({ isOpen,
                   menuSectionTitles,
                   menuSectionItems,
                   switchPageFunction }) {

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <SubmenuDropdown
          submenueTitles={menuSectionTitles}
          elementLists={menuSectionItems}
          pageSwitchFun={switchPageFunction}      
      />
      </aside>
    </>
  );

}

export default Sidebar;
