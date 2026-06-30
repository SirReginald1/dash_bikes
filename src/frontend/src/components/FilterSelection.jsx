import { useState, useEffect, useRef } from 'react'
import { useTheme } from "@mui/material/styles"
import { FormControl, Select, MenuItem } from "@mui/material"
//import Autocomplete from '@mui/material/Autocomplete';
//import TextField from '@mui/material/TextField';
//import Plot from 'react-plotly.js'
import { colors } from '@mui/material'
import CatFilterSelector from './CatFilterSelector.jsx'
import ContinuFilterSelector from './ContinuFilterSelector.jsx'
import "./FilterSelection.css"


// TODO: make options unselectable if they don't exist du to current filter selection
/**
 * 
 * @param {Object} accidentData Object containing data to be filtered.
 * @param {Object} variableKeyMap Object containing the metadata.
 * @param {Function} setFilterMapFunction The function that sets the values
 *  used for data filtering. This function must take as parameters in order:
 *  - String: The name of the variable to filter.
 *  - Array: That contains all the values to keep.
 *  - Number: Default set to undefined. The value that will be included in
 *    all filter output (used when includeNullVals is set to true).
 * @param {Boolean} includeNullVals If true will check if "null_replace_val"
 *  and "accepted_range" are present in the metadata for each continuous
 *  variable. If so the all values equal to "null_replace_val" will be included
 *  in all slider selections and the min and max selectable values will be set
 *  using "accepted_range". If false all values present in the data will be
 *  selectable.
 * @param {Array[String]} excludedVars Contains the variables to be excluded
 *  from the selection.
 * @param {Array[String]} categoricalVars Not implemented yet.
 * @param {Array[String]} continuousVars Not implemented yet.
 * @returns The filter selection component.
 */
export default function FilterSelection({accidentData,
                                         variableKeyMap,
                                         setFilterMapFunction,
                                         includeNullVals = true,
                                         excludedVars = [],
                                         categoricalVars = [],
                                         continuousVars = []
                                        }){

    function buildValueLookupMap(variableKeyMap){
        let out = []
        for(const [key, value] of Object.entries(variableKeyMap)){
            out.push([value, key])
        }
        return(out)
    }

    //if(excludedVars === undefined){
    //    excludedVars = []
    //}

    //const valueLookupMap = new Map(buildValueLookupMap(variableKeyMap))

    //function selectFilter(variable, values){
    //    //console.log(`selected values: ${Object.values(values)}`)
    //    let valuePaires = Object.values(values)
    //    let valueSet = new Set()
    //    for(const paire of valuePaires){
    //        valueSet.add(paire[0])
    //    }
    //    //console.log(`selected values raw: ${typeof({})}`)
    //    if(valuePaires.length > 0){ // Check to see if empty selection returns undefined
    //        filterMap.set(variable, valueSet)
    //    }
    //    else{ // If none or all are selected
    //        filterMap.delete(variable)
    //    }
    //    //setFilterMapFunction(filterMap)
    //    //console.log(`map size: ${filterMap.size}`)
    //    //console.log(`map set to: ${[...filterMap.entries()]}`)
    //}


    //console.log(`Filter selection key map: ${Object.entries(variableKeyMap)}`)
    
    function buildSelectors(accidentData, variableKeyMap){
        let out = []
        let keyIdx = 0
        for(const [key, value] of Object.entries(variableKeyMap)){
            //console.log(`tested key included: ${key}`)
            if(!excludedVars.includes(key)){
                //console.log(`key included: ${key}`)
                if(Object.hasOwn(value, "keys")){
                    //console.log(`key: ${key}, value: ${Object.entries(value)}`)
                    //console.log(`Select: key map type: ${typeof(variableKeyMap[key]["keys"])}`)
                    //console.log(`Select: key map: ${Object.entries(variableKeyMap[key]["keys"])}`)
                    //console.log(`key: ${key}, description: ${Object.keys(value)}`)
                    
                    out.push(
                        <CatFilterSelector
                            key={keyIdx}
                            variable={key}
                            dropdownLabel={variableKeyMap[key]["full_label"]}
                            options={Object.entries(variableKeyMap[key]["keys"])}
                            selectionFunction={setFilterMapFunction}
                        />
                        //<Autocomplete
                        //    multiple
                        //    clearOnEscape
                        //    id={`autocomp-${key}`}
                        //    //label={variableKeyMap["description"]}
                        //    onChange={(event, op) => selectionFunction(key, op)}
                        //    options={Object.entries(variableKeyMap[key]["keys"])}
                        //    getOptionLabel={(option) => (option[1])}
                        //    //filterSelectedOptions
                        //    renderInput={(params) => (
                        //        <TextField
                        //            {...params}
                        //            label={variableKeyMap[key]["description"]}
                        //        />
                        //    )}
                        ///>
                    )
                }
                else{
                    //console.log(`key list: ${Object.keys()}`)
                    //console.log(`key: ${key}`)
                    // Include null values in all selection filters if null value specified in metadata
                    let nullReplaceValue = undefined
                    let setMin = undefined
                    let setMax = undefined
                    if(includeNullVals & Object.hasOwn(variableKeyMap[key], "null_replace_val")){
                        nullReplaceValue = variableKeyMap[key]["null_replace_val"]
                    }
                    if(Object.hasOwn(variableKeyMap[key], "accepted_range")){
                        setMin = variableKeyMap[key]["accepted_range"][0]
                        setMax = variableKeyMap[key]["accepted_range"][1]
                    }
                    out.push(
                        <ContinuFilterSelector
                            key={keyIdx}
                            dataArray={accidentData[key]}
                            variableDescription={variableKeyMap[key]["full_label"]}
                            variable={key}
                            selectionFunction={setFilterMapFunction}
                            nullReplaceValue={nullReplaceValue}
                            setMin={setMin}
                            setMax={setMax}
                        />
                    )
                }
                keyIdx++
            }
        }
        return(out)
    }
                              
    return(
        <div id='controlParentDiv'>
            <FormControl id='formControl' key={"formKey"}>
                {buildSelectors(accidentData, variableKeyMap)}
            </FormControl>
        </div>
    )
}
