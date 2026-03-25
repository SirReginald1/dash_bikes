import { useState } from "react";
import Button from "@mui/material/Button";
import './SubmenuDropdown.css'

export default function SubmenuDropdown({submenueTitles,
                                         elementLists,
                                         pageSwitchFun}){
    
    // Check that both lists have the same length
    if(submenueTitles.length != elementLists.length){
        throw new Error(
            `submenueTitles (len: ${submenueTitles.length}) and `
            `elementLists (len: ${elementLists.length}) have different `
            `lengths.`
        )
    }

    // Array of booleans indicating which of the submenues are open.
    const [isOpen, setIsOpen] = useState(
        submenueTitles.map(() => false)
        //[false, false]
    );

    function switchIsOpenIndex(index){
        //console.log(`index: ${index}`)
        //console.log(`before switch: ${isOpen}`)
        let tempArray = isOpen.slice()
        tempArray[index] = !isOpen[index]
        setIsOpen(tempArray)
        //console.log(`after switch: ${isOpen}`)
    }

    return(
        <div className="submenuDropdownRootDiv">
            {submenueTitles.map((item, index) => (
                <div 
                    className="sectionBlock"
                    key={item}
                >
                    <div 
                        className="sectionTitleDiv"
                        onClick={() => switchIsOpenIndex(index)}
                    >
                        <span className="sectionTitleSpan">
                            {item}
                        </span>
                        <span className="arrowSpan">
                            <i className="arrowI" />
                        </span>
                    </div>
                    <div 
                        className={`dropdownSelectionDiv ${
                            isOpen[index] ? "open" : ""
                        }`}
                    >
                        <div className="slidingDiv">
                        {elementLists[index].map((item) => (
                        <Button 
                            className="pageSelectionBtn"
                            key={item}
                            onClick={() => pageSwitchFun(item)}
                         >
                            {item}
                        </Button>
                        ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}