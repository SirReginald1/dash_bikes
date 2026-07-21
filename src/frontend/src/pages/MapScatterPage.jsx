import { useState, useEffect, useRef, useMemo } from 'react'
import { useTheme } from "@mui/material/styles"
import { colors } from '@mui/material'
import { FormControl, Select, MenuItem } from "@mui/material"
import Plot from 'react-plotly.js'
import Plotly from 'react-plotly.js'
import { getIndexContinuBracketSet, getIndexesSet, concatIdxMap, extractValues, getIndexes } from '../utils.js'
import FilterSelection from '../components/FilterSelection.jsx'
import "./MapScatterPage.css"

Plotly.an

export default function MapScatterPage({filterBarIsOpen,
                                        uniqueYearsTemp,
                                        accidentData,
                                        variableKeyMap,
                                        uniqueVariablesTemp,
                                        themeMode}){

    // DEBUG
    /*
    let accidentDataTemp ={
        an:     [2025,      2026,   2024,   2026,   2023,   2026,   2025,      2026,   2024,   2026,   2023,   2026,    2024],
        grav:   [2,         2,      2,      3,      1,      2,      2,         2,      2,      3,      1,      2,       1],
        mois:   ["juillet", "juin", "mai", "avril", "juin", "juin", "juillet", "juin", "mai", "avril", "juin", "juin", "septembre"],
        age:    [20,        20,     30,     30,     30,     30,     30,         30,     25,    26,      65,     68,     65],
        lon:    [3,         3.1,    3.2,    3.3,    3.4,    3.5,    3.6,        3.7,    3.8,   3.9,     4,      4.1,    4.2],
        lat:    [45,        45.1,   45.2,   45.3,   45.4,   45.5,   45.6,       45.7,   45.8,  45.9,    46,     46.1,   46.2],
    }

    let variableKeyMapTemp = {
        grav: {
            keys: {"1": "Indemne", "2": "Tué", "3": "Blessé hospitalisé", "4": "Blessé léger"},
            full_label: "Gravité de blessure de l'usager",
            short_label: "Gravité",
            description: "Gravité de l'accident",
        },
        age:{
            description: "Age de l'usager",
            full_label: "Age de l'usager",
            short_label: "Age",
            load_as: "int",
            cat_group: {
                    "Moins de 18ans": [0, 17],
                    "Entre 18 et 30 ans": [18, 29],
                    "Entre 30 et 50 ans": [30, 49],
                    "Plus de 50 ans": [50, 9999]
               }
        }
    }
    */
    //
    const theme = useTheme();
    
    const [filterMapChangeFlag, setFilterMapChangeFlag] = useState(0);
    
    const [colorVarSelected, setColorVarSelected] = useState('None');

    const filterMap = useRef(new Map());

    const plotRef = useRef(null);

    const varsExcludedFromSelection = ['date', 'hrmn', 'dep', 'lat', 'lon']

    let mapTextArray = []
    for(let i=0;i<accidentData.lat.length;i++){
        // TODO: Make string building a loop
        mapTextArray.push(
            `Latitude: ${accidentData['lat'][i]}<br>` +
            `Longitude: ${accidentData['lon'][i]}<br>` +
            `${variableKeyMap['grav']['full_label']}: ${variableKeyMap['grav']['keys'][`${accidentData['grav'][i]}`]}<br>` +
            `${variableKeyMap['age']['full_label']}: ${accidentData['age'][i]}<br>`
        )
    }

    const layout = useMemo(() => { 
        if(colorVarSelected === 'None'){
            return({
                //autosize: true,
                map: {
                    style: 'open-street-map',
                    center: { lat: 48, lon: 3 },
                    zoom: 5.5
                },
                margin: {t: 0, r: 0, b: 0,  l: 0},
                //height: window.innerHeight - 90 // FIX: Try not to use this
            })
        }
        else{
            if(Object.hasOwn(variableKeyMap[colorVarSelected], 'keys')){
                return({
                    //autosize: true,
                    plot_bgcolor: theme.plotColors.plot_bgcolor,
                    paper_bgcolor: theme.plotColors.paper_bgcolor,
                    map: {
                        style: 'open-street-map',
                        center: { lat: 48, lon: 3 },
                        zoom: 5.5
                    },
                    margin: {t: 0, r: 0, b: 0,  l: 0},
                    //height: window.innerHeight - 90 // FIX: Try not to use this
                    legend:{
                        title: {
                            text: variableKeyMap[colorVarSelected]["full_label"],
                        },
                        font: {
                            color: theme.plotColors.legend_text_color,
                        },
                    },
                })
            }
            //console.log(`legend color: ${theme.plotColors.legend_text_color}`)
            return({
                //autosize: true,
                plot_bgcolor: theme.plotColors.plot_bgcolor,
                paper_bgcolor: theme.plotColors.paper_bgcolor,
                colorbar: true,
                map: {
                    style: 'open-street-map',
                    center: { lat: 48, lon: 3 },
                    zoom: 5.5
                },
                margin: {t: 0, r: 0, b: 0,  l: 0},
                //height: window.innerHeight - 90 // FIX: Try not to use this
                legend:{
                    title: {
                        text: variableKeyMap[colorVarSelected]["full_label"],
                    },
                    font: {
                        color: theme.plotColors.legend_text_color,
                    },
                },
            })
        }
    }, [themeMode, colorVarSelected])

    // Build traces // TODO: Simplify this nested mess
    const traces = useMemo(() => {
        let out = []
        let latitudes = []
        let longitudes = []
        let texts = []
        if(colorVarSelected === 'None'){
            if(filterMap.current.size > 0){
                let indexesSet = concatIdxMap(filterMap.current)
                for(const index of indexesSet){
                    latitudes.push(accidentData['lat'][index])
                    longitudes.push(accidentData['lon'][index])
                    texts.push(mapTextArray[index])
                    //colors.push('red')
                }
            }
            else{
                latitudes = accidentData['lat']
                longitudes = accidentData['lon']
                texts = mapTextArray
                //colors = 'red'//accidentData[]
            }
            return [
                {
                    type: 'scattermap',
                    lat: latitudes,
                    lon: longitudes,
                    text: texts,
                    mode: 'markers',
                    marker: {
                        size: 8,
                        color: 'steelblue'
                    }
                }
            ];
        }
        else{
            let out = []
            //let colorLegendNames = Object.entries(variableKeyMap[colorVarSelected]['keys'])
            //console.log(`Color select var not none: ${colorVarSelected}, filter map size: ${filterMap.current.size}`)
            if(Object.hasOwn(variableKeyMap[colorVarSelected], 'keys')){
                //console.log(`Color select var: ${colorVarSelected}`)
                let idx = 0
                for(const [key, value] of Object.entries(
                    variableKeyMap[colorVarSelected]['keys']
                )){
                    let latitudes = []
                    let longitudes = []
                    let texts = []
                    let indexesSet = getIndexes(
                        accidentData[colorVarSelected],
                        Number(key),
                        concatIdxMap(filterMap.current)
                    )
                    //console.log(`index set: ${indexesSet}, value: ${Number(key)}`)
                    for(const index of indexesSet){
                        latitudes.push(accidentData['lat'][index])
                        longitudes.push(accidentData['lon'][index])
                        texts.push(mapTextArray[index])
                        //console.log(`index loop: ${index}, latitude: ${accidentData['lat'][index]}, longitude: ${accidentData['lon'][index]}`)                            
                    }
                    //console.log(``)
                    out.push({
                        type: 'scattermap',
                        lat: latitudes,
                        lon: longitudes,
                        text: texts,
                        mode: 'markers',
                        name: value,
                        cluster: {
                            enabled: false,
                            opacity: 0.8,
                            //maxzoom: 10,
                            //size: 100,
                            step: 0.9
                        },
                        marker: {
                            size: 8,
                            opacity: 0.8,
                            color: theme.plotColors.multi_line_color[idx]
                        }
                    })
                    idx ++
                }
            }
            else{
                 if(filterMap.current.size > 0){
                    let indexesSet = concatIdxMap(filterMap.current)
                    for(const index of indexesSet){
                        latitudes.push(accidentData['lat'][index])
                        longitudes.push(accidentData['lon'][index])
                        texts.push(mapTextArray[index])
                        //colors.push('red')
                    }
                }
                else{
                    latitudes = accidentData['lat']
                    longitudes = accidentData['lon']
                    texts = mapTextArray
                    //colors = 'red'//accidentData[]
                }
                return [
                    {
                        type: 'scattermap',
                        lat: latitudes,
                        lon: longitudes,
                        text: texts,
                        mode: 'markers',
                        legendwidth: 10,
                        marker: {
                            size: 8,
                            color: accidentData[colorVarSelected],
                            reversescale: true,
                            colorscale: [[0,'rgb(5, 10, 172)'],[0.35,'rgb(40, 60, 190)'],[0.5,'rgb(70, 100, 245)'], [0.6,'rgb(90, 120, 245)'],[0.7,'rgb(106, 137, 247)'],[1,'rgb(220, 220, 220)']],
                            colorbar: {
                                //thickness: 10,
                                //outlinecolor: 'white',
                                //ticksuffix: 'ans',
                                //dtick: 0.1,
                                ticks: 'inside',
                                ticklen: 10,
                                tickcolor: 'black',
                                title: {
                                    text: variableKeyMap[colorVarSelected]["full_label"],
                                    font: {
                                        color: theme.plotColors.legend_text_color,
                                    }
                                },
                                tickfont: {
                                    color: theme.plotColors.legend_text_color,
                                }
                            }
                        }
                    }
                ];
            }
            return out;
        }
    }, [filterMapChangeFlag, colorVarSelected]);

   // Initial render
    useEffect(() => {
        Plotly.newPlot(
            plotRef.current,
            traces,
            layout,
            {responsive: true}
        );
        // Resize with window
        const handleResize = () => {
            Plotly.Plots.resize(plotRef.current)
        };
        window.addEventListener('resize', handleResize);
        requestAnimationFrame(() => {Plotly.Plots.resize(plotRef.current)});
        return () => {window.removeEventListener('resize', handleResize)};
    }, [filterBarIsOpen])

    // Update traces when filters change
    useEffect(() => {
        Plotly.react(plotRef.current, traces, layout)
    }, [traces, colorVarSelected, filterBarIsOpen])
    
    // TODO: Try to clean up logic for this function 
    /**
     * Function that is passed to each selector element to set that map
     * of selected indexes.
     * @param {String} variable The variable label as it appears in the data
     *  object.
     * @param {Array[String | Number]} values Array containing all the selected
     *  values.
     * @param {Number} includeValues A value to include in every selection.
     *  Used to include "null" values. Default is undefined.
     */
    function setFilterMap(variable, values, includeValues = undefined){
        // Var is categorical
        if(Object.hasOwn(variableKeyMap[variable], 'keys')){
            let valueSet = new Set()
            for(const paire of values){
                // Try to clean up this logic
                if(values instanceof Array){
                    // Allow this to work for strings
                    if(Number.isNaN(Number(paire[0]))){
                        valueSet.add(paire[0])    
                    }
                    else{
                        valueSet.add(Number(paire[0]))
                    }
                }
                else{
                    valueSet.add(paire)
                }
            }
            if(valueSet.size > 0){
                filterMap.current.set(
                    variable,
                    getIndexesSet(accidentData[variable], valueSet)
                )
            }
            else{ // If none or all are selected
                filterMap.current.delete(variable)
            }
        }
        else{
            // If variable set to all
            if(values === 'all'){
                filterMap.current.delete(variable)
            }
            else{
                filterMap.current.set(
                    variable,
                    getIndexContinuBracketSet(
                        accidentData[variable],
                        values,
                        includeValues
                        //variableKeyMap[variable]["null_replace_val"]
                    )
                )
            }
        }
        //setFilterMapFunction(filterMap)
        //console.log(`map size: ${filterMap.current.size}`)
        //console.log(`map set to: ${[...filterMap.current.entries()]}`)
        //for(const [k, v] of filterMap.current.entries()){
        //    console.log(`key: ${k}`)
        //    console.log(`set: ${[...v]}`)
        //}
        //console.log(`Flag change initial. val: ${filterMapChangeFlag}`)
        setFilterMapChangeFlag(filterMapChangeFlag == 0 ? 1 : 0)
        //console.log(`Flag change after switch. val: ${filterMapChangeFlag}`)

    }
    
    return(
        <div id='rootDiv'>
            <span id='contentSpan'>
                <div id='rootDropdownDiv'>
                    <h4 id='colorSelectTitle'>
                        Variable color selection
                    </h4>
                    <FormControl id='colorVarSelectFormControl'>
                        <Select
                            id='colorVarSelect'
                            value={colorVarSelected}
                            onChange={(event) => setColorVarSelected(event.target.value)}
                        >
                            {[
                                <MenuItem
                                    className="navbarMenuItem"
                                    key='None'
                                    value='None'
                                >
                                    None
                                </MenuItem>
                            ].concat(Object.keys(variableKeyMap).map((key, idx) => {
                                if(!varsExcludedFromSelection.includes(key)){
                                    return(
                                        <MenuItem
                                            className="navbarMenuItem"
                                            key={key}
                                            value={key}
                                        >
                                            {variableKeyMap[key]['full_label']}
                                        </MenuItem>
                                    )
                                }
                            }))}
                        </Select>
                    </FormControl>
                    <h4 id='filterSelectionTitle'>
                        Filter selection
                    </h4>
                    <FilterSelection
                        accidentData={accidentData}
                        variableKeyMap={variableKeyMap}
                        //filterMap={filterMap}
                        setFilterMapFunction={setFilterMap}
                        excludedVars={varsExcludedFromSelection}
                    />
                </div>
                <div id='mapDiv'>
                    <div ref={plotRef} id='map'/>
                </div>
            </span>
        </div>
    )
}
