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


// TODO: make options unselectable if
export default function FilterSelection({accidentData,
                                         variableKeyMap,
                                         filterMap,
                                         setFilterMapFunction
                                        }){

    function buildValueLookupMap(variableKeyMap){
        let out = []
        for(const [key, value] of Object.entries(variableKeyMap)){
            out.push([value, key])
        }
        return(out)
    }

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
            if(Object.hasOwn(value, "keys")){
                //console.log(`key: ${key}, value: ${Object.entries(value)}`)
                //console.log(`Select: key map type: ${typeof(variableKeyMap[key]["keys"])}`)
                //console.log(`Select: key map: ${Object.entries(variableKeyMap[key]["keys"])}`)
                //console.log(`key: ${key}, description: ${Object.keys(value)}`)
                out.push(
                    <CatFilterSelector
                        key={keyIdx}
                        variable={key}
                        dropdownLabel={variableKeyMap[key]["description"]}
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
                out.push(
                    <ContinuFilterSelector
                        key={keyIdx}
                        dataArray={accidentData[key]}
                        variableDescription={variableKeyMap[key]["description"]}
                        variable={key}
                        selectionFunction={setFilterMapFunction}
                    />
                )
            }
            keyIdx++
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
