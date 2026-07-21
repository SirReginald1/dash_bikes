import {useMemo} from "react";
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
                                        headerComponent = undefined,
                                        callbackFunctionMap}) {
  //let header
  //if(headerComponent === undefined){
  //  console.log("Header undefined")
  //  header = headerComponent
  //}

  /*
  const header = useMemo(() => {
    switch(){}
    return(
        <FilterSelection
            accidentData={accidentData}
            variableKeyMap={variableKeyMap}
            setFilterMapFunction={setFilterMapFunction}
            excludedVars={excludedVars}
         />
  )
  }, [])
  */



  return (
    <div id={id} className={`${className}`}>
        {headerComponent}
        <FilterSelection
            accidentData={accidentData}
            variableKeyMap={variableKeyMap}
            setFilterMapFunction={setFilterMapFunction}
            excludedVars={excludedVars}
            callbackFunctionMap={callbackFunctionMap}
         />
    </div>
  );
 
}