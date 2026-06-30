import { useState, useEffect, useRef, useMemo } from 'react'
import { useTheme } from "@mui/material/styles"
import { colors } from '@mui/material'
import { FormControl, Select, MenuItem } from "@mui/material"
import Plot from 'react-plotly.js'
import {getIndexContinuBracketSet,
        getIndexesSet,
        concatIdxMap,
        extractValues,
        getIndexes,
        filterByValues,
        depToRegCodeMap} from '../utils.js'
import FilterSelection from '../components/FilterSelection.jsx'
import "./MapScatterPage.css"


// TODO: Add ration to population
export default function MapRegionPage({uniqueYears,
                                       accidentData,
                                       variableMetadata,
                                       metadata,
                                       geojsonData,
                                       zoneIndexMap,
                                       zoneComputedData,
                                       loadingGeoJsonData,
                                       themeMode}){

    // DEBUG
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

    const colorValLabel = new Map([
        ['perAcc', 'Nb acc/10000 hab']
    ]);

    const theme = useTheme();

    const [filterMapChangeFlag, setFilterMapChangeFlag] = useState(0);
    
    const [colorVarSelected, setColorVarSelected] = useState('perAcc');

    const [colorModalitySelected, setColorModalitySelected] = useState('None');

    const [selectedZones, setSelectedZones] = useState("reg");

    const [nbAccTot, setNbAccTot] = useState(0);

    const [nbAccPer, setNbAccPer] = useState(0);

    const filterMap = useRef(new Map());

    const plotRef = useRef(null);

    const traces = useMemo(() => {
            // Build data arrays
            // Check if metadata for var has keys (is categorical)
            let colVals = []
            let lebelVals = []
            let geojsonKeys = []
            // Find the value that the least keys to use as iterator
            let zoneIterator
            if (zoneIndexMap.get(selectedZones).size < zoneComputedData.get(selectedZones)){
                zoneIterator = zoneIndexMap.get(selectedZones).keys()
            }
            else{
                zoneIterator = zoneComputedData.get(selectedZones).keys()
            }
            for(let zone of zoneIterator){
                // Only add data if pressent in both datasets
                let zoneFromBaseData = zoneIndexMap.get(selectedZones).get(zone)
                let zoneFromGeojson = zoneComputedData.get(selectedZones).get(zone)
                if(zoneFromBaseData !== undefined && zoneFromGeojson !== undefined){
                    // Add computed values to map arrays
                    let computedVal
                    console.log(`zone: ${zone}`)
                    console.log(`indexes: ${zoneFromBaseData}`)
                    console.log(`filter map keys: ${[...filterMap.current.keys()]}`)
                    //let filteredIndexes = zoneFromBaseData
                    let filteredIndexes = filterByValues(
                        accidentData,
                        filterMap.current,
                        zoneFromBaseData
                    )
                    console.log(`filteredIndexes: ${filteredIndexes}`)
                    if(colorVarSelected === 'perAcc'){
                        computedVal = (filteredIndexes.length / 
                            (zoneFromGeojson.get("pop") / 10000))
                        lebelVals.push(computedVal.toFixed(3))
                    }
                    else{
                        computedVal = filteredIndexes.length
                        lebelVals.push(computedVal)
                    }
                    geojsonKeys.push(zone)
                    colVals.push(Math.log(computedVal))
                }
            }
            // Build hover message
            let hoverMessage
            let unitLabel
            let specialUnitLabel = colorValLabel.get(colorVarSelected)
            if(specialUnitLabel === undefined){
                unitLabel = "Nb accidents"
            }
            else{
                unitLabel = specialUnitLabel
            }
            // Select color variable
            if(colorVarSelected === 'perAcc'){
                hoverMessage = "<b>%{properties.nom}</b><br>" +
                               "Population: %{properties.pop}<br>" +
                               `${unitLabel}: %{customdata}<extra></extra>`
            }

            return(
                [{
                    type: "choroplethmap",
                    geojson: geojsonData.get(selectedZones),
                    locations: geojsonKeys, // The keys used to match zone to z value
                    z: colVals,
                    featureidkey: "properties.code",
                    colorscale: "Viridis",
                    marker: {
                      line: {
                        width: 1,
                        color: "white"
                      }
                    },
                    colorbar: {
                      title: "Value"
                    },
                    customdata: lebelVals,
                    hovertemplate: "<b>%{properties.nom}</b><br>" +
                                   "Population: %{properties.pop}<br>" +
                                   `${unitLabel}: %{customdata}<extra></extra>`,
                    hovertemplatefallback: "NA"
                  }
                ]
            )
        },
        [filterMapChangeFlag, colorVarSelected]
    );



    const layout = useRef({
        map: {
            style: "dark",
            center: {lon: 2.5, lat: 46.5},
            zoom: 5.5
        },
        //width: 600,
        //height: 400,
        margin: {t: 0, b: 0, r:0, l:0}
    },
);


   // Initial render
    useEffect(() => {
        //console.log(`geo region: ${testGeo}`)
        //console.log(`geo test: ${Object.keys(geoData.test)}`)
        Plotly.newPlot(
            plotRef.current,
            traces,
            //data,
            layout.current,
            {responsive: true}
        );
        // Resize with window
        const handleResize = () => {
            Plotly.Plots.resize(plotRef.current)
        };
        window.addEventListener('resize', handleResize);
        requestAnimationFrame(() => {Plotly.Plots.resize(plotRef.current)});
        return () => {window.removeEventListener('resize', handleResize)};
    }, [])

    // Update traces when filters change
    useEffect(() => {
        Plotly.react(
            plotRef.current,
            traces,
            layout.current
        )
    }, [traces/*, colorVarSelected*/])
    
    /**
     * Function that is passed to each selector element to set that map
     * of selected indexes.
     * @param {String} variable The variable label as it appears in the data
     *  object.
     * @param {Array[String | Number]} values Array containing all the selected
     *  values.
     */
    function setFilterMap(variable, values){
        if(Object.hasOwn(variableMetadata[variable], 'keys')){
            let valueSet = new Set()
            for(const paire of values){
                if(values instanceof Array){
                    valueSet.add(Number(paire[0]))
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
                    getIndexContinuBracketSet(accidentData[variable], values)
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
                        Type de comptage
                    </h4>
                    <FormControl id='colorVarSelectFormControl'>
                        <Select
                            id='colorVarSelect'
                            value={colorVarSelected}
                            onChange={(event) => setColorVarSelected(event.target.value)}
                        >
                            <MenuItem
                                className="navbarMenuItem"
                                key='perAcc'
                                value='perAcc'
                            >
                                Nombre d'accidents
                            </MenuItem>
                            <MenuItem
                                className="navbarMenuItem"
                                key='totAcc'
                                value='totAcc'
                            >
                                Nombre D'accident pour 10000 habitents
                            </MenuItem>


                        </Select>
                    </FormControl>
                    <h4 id='filterSelectionTitle'>
                        Filter selection
                    </h4>
                    <FilterSelection
                        accidentData={accidentData}
                        variableKeyMap={variableMetadata}
                        filterMap={filterMap}
                        setFilterMapFunction={setFilterMap}
                    />
                </div>
                <div id='mapDiv'>
                    <div ref={plotRef} id='map'/>
                </div>
            </span>
        </div>
    )
}
