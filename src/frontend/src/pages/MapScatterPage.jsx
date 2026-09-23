import { useEffect, useRef, useMemo } from 'react'
import { useTheme } from "@mui/material/styles"
//import { colors } from '@mui/material'
//import { FormControl, Select, MenuItem } from "@mui/material"
//import Plot from 'react-plotly.js'
import { concatIdxMap, getIndexes } from '../utils.js'
//import FilterSelection from '../components/FilterSelection.jsx'
import "./MapScatterPage.css"

//Plotly.an

export default function MapScatterPage({filterBarIsOpen,
                                        uniqueYearsTemp,
                                        accidentData,
                                        variableKeyMap,
                                        uniqueVariablesTemp,
                                        colorVarSelected,
                                        idxFilterSet,
                                        idxFilterMap,
                                        themeMode}){


    const theme = useTheme();

    const filterMap = useRef(new Map());

    const plotRef = useRef(null);
    
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
            if(/*filterMap.current.size*/idxFilterMap.size > 0){
                //let indexesSet = concatIdxMap(filterMap.current)
                for(const index of idxFilterSet/*indexesSet*/){
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
                        concatIdxMap(/*filterMap.current*/idxFilterMap)
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
    }, [/*filterMapChangeFlag, */colorVarSelected, idxFilterSet]);

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
    
    return(
        <div id='rootDiv'>
                <div id='mapDiv'>
                    <div ref={plotRef} id='map'/>
                </div>
        </div>
    )
}
