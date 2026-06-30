import { useState, useEffect, useRef } from 'react'
import { useTheme } from "@mui/material/styles"
//import {FormControl, Select, MenuItem} from "@mui/material"
import Slider from '@mui/material/Slider';
import { colors } from '@mui/material'
import { buildSelectedYearSet } from '../utils'
import "./ContinuFilterSelector.css"

const minDistance = 0;

/**
 * 
 * @param {Array} dataArray
 * @param {String} variable
 * @param {String} variableDescription
 * @param {Function} selectionFunction
 * @param {Boolean | undefined} nullReplaceValue
 * @param {Numeric | undefined} setMin
 * @param {Numeric | undefined} setMax 
 * @returns 
 */
export default function ContinuFilterSelector({dataArray,
                                               variable,
                                               variableDescription,
                                               selectionFunction,
                                               nullReplaceValue = undefined,
                                               setMin = undefined,
                                               setMax = undefined,
                                               }){

    const minValue = setMin === undefined ? Math.min(...dataArray) : setMin

    const maxValue = setMax === undefined ? Math.max(...dataArray) : setMax

    const [selectedValues, setSelectedValues] = useState([minValue, maxValue]);

    return(
        <div>
            <h5 id='sliderTitle'>
                {`${variableDescription}: ${
                    selectedValues[0]}, ${selectedValues[1]}`}
            </h5>
            <Slider
                onChangeCommitted={
                    (event, value) => {
                        setSelectedValues(value)
                        //console.log(`value: ${value}`)
                        if(value[0] === minValue & value[1] === maxValue){
                            selectionFunction(variable, 'all', nullReplaceValue)
                        }
                        else{
                            selectionFunction(variable, value, nullReplaceValue)
                        }
                    }
                }
                //track={false}
                //defaultValue={selectedValues}
                value={selectedValues}
                valueLabelDisplay='auto'
                //marks={buildSliderMarks(uniqueYears)}
                //step={uniqueYears.length}
                min={minValue}
                max={maxValue}
                disableSwap
                //valueLabelDisplay="off"
            />
      
        </div>
    )
}