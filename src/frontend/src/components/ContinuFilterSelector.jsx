import { useState, useEffect, useRef } from 'react'
import { useTheme } from "@mui/material/styles"
//import {FormControl, Select, MenuItem} from "@mui/material"
import Slider from '@mui/material/Slider';
import { colors } from '@mui/material'
import { buildSelectedYearSet } from '../utils'
import "./ContinuFilterSelector.css"

const minDistance = 0;

export default function ContinuFilterSelector({dataArray,
                                               variable,
                                               variableDescription,
                                               selectionFunction}){

    const minValue = Math.min(...dataArray)

    const maxValue = Math.max(...dataArray)

    const [selectedValues, setSelectedValues] = useState([minValue, maxValue]);

    return(
        <div>
            <h5 id='sliderTitle'>
                {`${variableDescription}: ${
                    selectedValues[0]}, ${selectedValues[1]}`}
            </h5>
            <Slider
                onChange={
                    (event, value) => {
                        setSelectedValues(value)
                        //console.log(`value: ${value}`)
                        if(value[0] === minValue & value[1] === maxValue){
                            selectionFunction(variable, 'all')
                        }
                        else{
                            selectionFunction(variable, value)
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