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
                                        callbackFunctionMap,
                                        sliderColor = undefined}) {

  return (
    <div id={id} className={`${className}`}>
        {headerComponent}
        <FilterSelection
            accidentData={accidentData}
            variableKeyMap={variableKeyMap}
            setFilterMapFunction={setFilterMapFunction}
            excludedVars={excludedVars}
            callbackFunctionMap={callbackFunctionMap}
            sliderColor={sliderColor}
         />
    </div>
  );
 
}
