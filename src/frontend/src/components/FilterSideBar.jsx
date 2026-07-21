import useState from "react";
import Button from "@mui/material/Button";
import FilterSelection from '../components/FilterSelection.jsx'
import "./FilterSideBar.css";


// TODO: Make filter remember selection between page
export default function FilterSidebar({ id,
                                        className,
                                        isOpen,
                                        accidentData,
                                        variableKeyMap,
                                        setFilterMapFunction,
                                        excludedVars,
                                        filterMap, /* Used to keep selection between pages*/ 
                                        headerComponent = undefined}) {
  let header
  if(headerComponent === undefined){
    header = headerComponent
  }


  return (
    <div id={id} className={`${className}`}>
        {/*header*/}
        <FilterSelection
            accidentData={accidentData}
            variableKeyMap={variableKeyMap}
            setFilterMapFunction={setFilterMapFunction}
            excludedVars={excludedVars}
         />
    </div>
  );
 
}