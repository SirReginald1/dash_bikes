import {FormControl, Select, MenuItem} from "@mui/material";
import "./NavbarDropdownSpan.css"


/**
 * Span containing an adjustable number of dropdown menus based on the
 * number of provided dropdown menu item list.
 * 
 * @param {Array} dropdownItemLabels A list of lists containing all the
 *  labels for each dropdown menu. The number of dropdown menus is
 *  rendered based on the length of the first dimension of this array.
 * @param {Array} dropdownSelectedVals Reactive variable containing all
 *  the selected values.
 * @param {Function} setSelectedVals The function used to set the selected
 *  values. 
 * @returns The HTML for the dropdown span.
 */
export default function NavbarDropdownSpan({dropdownItemLabels,
                                            dropdownSelectedVals,
                                            setSelectedVals}) {
    
    /**
     * Function used to adjust the length of the first dimension of the
     * dropdown label array depending the selection of the first dropdown
     * menu. Will therefore adjust the number of rendered dropdowns in
     * the span.
     * 
     * @param {Array} allLabels The full list of all dropdown contents.
     * @param {Array} selectedValues The array containing all the selected
     *  values in the dropdown span.
     * @returns The array that has been adjusted based on the selection
     *  of the first selected value.
     */
    function adjustDropdownValues(allLabels, selectedValues){
        if(selectedValues[0] === "Nationale")
            return([allLabels[0]])
        return(allLabels)
    }

    const handleChange = (index) => (event) => {
        const updated = [...dropdownSelectedVals];
        updated[index] = event.target.value;
        if(updated[0] === "Nationale"){
            //console.log([updated[0]])
            setSelectedVals([updated[0]]);
        }
        else{
            //console.log(updated)
            setSelectedVals(updated);
        }
    };

    return (
          <span className="mainNavbarDropdownSpan">
                {adjustDropdownValues(
                    dropdownItemLabels,
                    dropdownSelectedVals
                 ).map((menu, index) => (
                    <FormControl
                        key={index}
                    >
                        <Select
                            key={index}
                            size="small"
                            value={dropdownSelectedVals[index]}
                            onChange={handleChange(index)}
                        >
                            {menu.map(item => (
                                <MenuItem
                                    className="navbarMenuItem"
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
          </span>
    );
}