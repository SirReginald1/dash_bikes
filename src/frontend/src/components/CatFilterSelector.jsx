import { useState, useEffect, useRef } from 'react'
import { useTheme } from "@mui/material/styles"
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
//import Stack from '@mui/material/Stack';
import { colors } from '@mui/material'
import "./CatFilterSelector.css"



export default function CatFilterSelector({variable,
                                           dropdownLabel,
                                           options,
                                           selectionFunction}){

    //function buildMenuItems(variableKeyMap, selectionFunction){
    //    let out = []
    //    for()
    //    return(out)
    //}

    //console.log(`Cat var key map type: ${variableKeyMap}`)
    //console.log(`Cat var key map entries: ${Object.entries(variableKeyMap)}`)
    //
    //function buildOptionsEntries(variableKeyMap){
    //    let out = []
    //    for(const [label, value] of variableKeyMap){
    //        out.push({lable: label})
    //    }
    //    return(out)
    //}

    return(
        <Autocomplete
            multiple
            clearOnEscape
            id={`autocomp-${variable}`}
            //label={variableKeyMap["description"]}
            onChange={(event, value) => selectionFunction(variable, value)}
            options={options}
            getOptionLabel={(option => option[1])}
            //filterSelectedOptions
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={dropdownLabel}
                />
            )}
        />
    )
}