import { useState, useEffect, useMemo } from 'react'
import { useTheme } from "@mui/material/styles"
import Slider from '@mui/material/Slider';
import {Select, MenuItem, InputLabel} from "@mui/material";
import Plot from 'react-plotly.js'
import { getIndexes,
         monthList,
         getIndexesCategorical,
         getIndexesSet,
         getIndexesCategoricalSet,
         insertLineBreaks,
        } from "../utils"
import "./CharacteristicsPage.css"

// TODO: Make map of precalculated indexes for each unique value on server to
// speed-up application.
// TODO: Speed up subset comparisons by only comparing valid subset indexes
// TODO: Make functions that output sets.
// TODO: Add window popup on trace click with dropdown var select to cross
// reference with any other variable
// TODO: add condition so that year filtering only happens if not all years are selected
// TODO: add check for var type at page level to save compute 
export default function CharacteristicsPage({uniqueYears,
                                             accidentData,
                                             variableKeyMap,
                                             filterMap,
                                             idxFilterSet,
                                             uniqueVariablesTemp,}){
    
    const theme = useTheme();

    let uniqueVariables = Object.keys(variableKeyMap)
    
    // This variable is only used build variable selection
    let categoricalVariables = []

    let continuousVariables = []

    for(const key of uniqueVariables){
        if(key === 'dep'){
            continue;
        }
        if(Object.hasOwn(variableKeyMap[key], "keys") ||
            Object.hasOwn(variableKeyMap[key], "cat_group")){
                categoricalVariables.push(key)
        }
        if(Object.hasOwn(variableKeyMap[key], "cat_group")){
            continuousVariables.push(key)
        }
        else{
            continuousVariables.push(key)
        }
    }

    let monthIdxMap = new Map()
    for(const month of monthList){
        monthIdxMap.set(month, getIndexes(accidentData["mois"], month))
    }
    //

    const [selectedYears, setSelectedYears] = useState(
        [Math.min(...accidentData.an), Math.max(...accidentData.an)] 
    );

    const selectedYearsSet = useMemo(() => {
        return(buildFilterYearSet(selectedYears))
        },
        [selectedYears]
    );

    const selectedYearsIndexSet = useMemo(() => {
            return(getIndexesSet(
                accidentData["an"],
                buildFilterYearSet(selectedYears)
            ))
        },
        [selectedYears, accidentData]
    );

    const [selectedVariable1, setSelectedVariable1] = useState("age");

    const [selectedVariable2, setSelectedVariable2] = useState("grav");

    const [selectedVar1IndexMap, setSelectedVar1IndexMap] = useState(
        new Map()
    );

    const selectedVar1IndexMap2 = useMemo(() => {
        let out = new Map()
        for(const [k,v] of getIndexesCategoricalSet(
            accidentData,
            variableKeyMap,
            selectedVariable1,
            selectedYearsIndexSet
        )){
            //console.log(`key: ${k}, val: ${v.size}`)
            //console.log(`selected years: ${selectedYears}`)
            //console.log(`intersection len: ${[...new Set(v).intersection(selectedYearsIndexSet)].length}`)
            out.set(k, v)
        }
        return(out)
    }, [selectedVariable1, selectedYearsIndexSet]);

    // Remove this only keep relusting arrays
    const [selectedVar1ValLabels, setSelectedVar1ValLabels] = useState(
        [...selectedVar1IndexMap.keys()]
    );
    const [selectedVar1ValCounts, setSelectedVar1ValCounts] = useState(
        new Array()
    );

    /*const [selectedVar1UniqueValues, setSelectedVar1UniqueValues] = useState(
        new Array()
    );*/
    
    ////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        setSelectedVar1ValLabels([...selectedVar1IndexMap2.keys()])
        let valueCounts = new Array()
        if(filterMap.size === 0 & idxFilterSet.size === 0){
            for(const set of selectedVar1IndexMap2.values()){
                valueCounts.push(set.size)
            }
        }
        else if(filterMap.size > 0 & idxFilterSet.size === 0){
            for(const set of selectedVar1IndexMap2.values()){
                valueCounts.push(0)
            }
        }
        else{
            for(const set of selectedVar1IndexMap2.values()){
                valueCounts.push(set.intersection(idxFilterSet).size)
            }
        }
        setSelectedVar1ValCounts(valueCounts)
    }, [selectedYearsIndexSet, selectedVariable1, idxFilterSet]);
    ////////////////////////////////////////////////////////////////////////////////////////


    const stackedPlotTraces = useMemo(() => {
        //console.log("Entered: stackedPlotTraces useMemo!")
            let out = []
            
            // TODO: Change this so that comparisons aren't done at each
            // iteration of the loop.
            /**
             * Function used to combine filter bar sets with other filter
             * sets.
             * @param {*} otherFilterSet The set produced by an other filter.
             * @param {*} filterMap The filter bar filter map.
             * @param {*} idxFilterSet The set of valid indexes produced by the
             * filter bar.
             * @returns The set combined set of filters from both sets.
             */
            function getFilterSet(otherFilterSet, filterMap, idxFilterSet){
                if(filterMap.size === 0 & idxFilterSet.size === 0)
                    return(otherFilterSet)
                else if(filterMap.size > 0 & idxFilterSet.size === 0)
                    return(idxFilterSet)
                else
                    return(otherFilterSet.intersection(idxFilterSet))
            }

            //let filterMap = new Map()
            let yearHoverLabel = selectedYears[0] === selectedYears[1] ? selectedYears[1] : 
                `${selectedYears[0]}, ${selectedYears[1]}`
            // Used to iterate only through pre-computed sets of indexes
            // for each step (reduce nb of comparisons)
            let variableKeyValues = [...selectedVar1IndexMap2.keys()]
            //console.log(`variableKeyValues: ${variableKeyValues}`)
            for(let i=0;i<selectedVar1IndexMap2.size;i++){
                let monthCount = new Array(monthList.length)
                for(let monthIdx=0;monthIdx<monthList.length;monthIdx++){
                    monthCount[monthIdx] = getIndexes(
                        accidentData['mois'],
                        monthList[monthIdx],
                        getFilterSet(
                            selectedVar1IndexMap2.get(variableKeyValues[i]),
                            filterMap,
                            idxFilterSet
                        )
                    ).length
                }
                //console.log(`month count: ${monthCount}`)

                out.push({
                    x: monthList,
                    y: monthCount,
                    type: 'scatter',
                    //stackgroup: 'one',
                    //fill: 'toself',
                    marker: {
                        color: theme.plotColors.multi_line_color[i],
                    },
                    name: insertLineBreaks(variableKeyValues[i], 25),//`${variableValues[i]}`,
                    hovertemplate: `Mois: %{x}<br>`+
                                   `Nombre: %{y}<br>`+
                                   `Année: ${yearHoverLabel}`,
                })
            }
            //console.log(`stacked data: ${JSON.stringify(out)}`)
            return(out)
        }, [selectedYears, selectedVariable1, idxFilterSet]);

    const stackedPlotLayout = useMemo(() => {
        let titleContent = `Nombre d'accidents par ${
            variableKeyMap[selectedVariable1]["full_label"].toLowerCase()
        } années ${selectedYears[0]}-${selectedYears[1]}`
        let titleIsLong = titleContent.length > 72
        if(titleIsLong){
            // Find first space before len 72
            for(let i=72;i>0;i--){
                if(titleContent[i] === ' '){
                   titleContent = `${titleContent.substring(0, i)}<br>
                    ${titleContent.substring(i + 1, titleContent.length)}`
                    break
                }
            }
        }
        return(
            {
                //width: 320,
                //height: 240,
                plot_bgcolor: theme.plotColors.plot_bgcolor,
                paper_bgcolor: theme.plotColors.paper_bgcolor,
                margin: {
                    t: titleIsLong ? 50 : 30,
                    b: 50,
                    r: 20,
                    l: 50,
                },
                legend:{
                    title: {
                            text: insertLineBreaks(
                                variableKeyMap[selectedVariable1]["full_label"],
                                26
                            ),
                        },
                        font: {
                            color: theme.plotColors.legend_text_color,
                        },
                },
                title: {
                    text: `<b>${titleContent}</b>`,
                    y: titleIsLong ? 0.96 : 0.98,
                    x: 0.5,
                    xanchor: 'center',
                    yanchor: 'top',
                    font: {
                        size: 20,
                        family: 'Arial, sans-serif',
                        color: theme.plotColors.title_color,
                    }
                },
                xaxis: {
                    color: theme.plotColors.xaxis_color,
                    gridcolor: theme.plotColors.xaxis_grid_color,
                    title: {
                        text: 'Mois'
                    },
                    dtick: 1
                },
                yaxis: {
                    color: theme.plotColors.yaxis_color,
                    gridcolor: theme.plotColors.yaxis_grid_color,
                    title: {
                        text: "Nombre d'accident"
                    },
                    //dtick: 1
                }
            }
        )
    }, [selectedVariable1, selectedYears, idxFilterSet, theme])

    const barPlotTraces = useMemo(() => {
            let out = []
            for(let idx=0;idx<selectedVar1ValLabels.length;idx++){
                out.push({
                    x: [selectedVar1ValLabels[idx]],
                    y: [selectedVar1ValCounts[idx]],
                    type: 'bar',
                    //mode: 'lines+markers',
                    marker: {
                        color: theme.plotColors.multi_line_color[idx]
                    },
                    visible: `test ${idx}`,
                    name: insertLineBreaks(
                        selectedVar1ValLabels[idx],
                        25
                    ),
                    hovertemplate: `Blessure: %{x}<br>`+
                                   `Nombre: %{y}`,
                })
            }
            return(out)
        }, [selectedVar1ValLabels, selectedVar1ValCounts])

    const barPlotLayout = useMemo(() => {
        let out = {
            //width: 320,
            //height: 240,
            plot_bgcolor: theme.plotColors.plot_bgcolor,
            paper_bgcolor: theme.plotColors.paper_bgcolor,
            margin: {
                    t: 30,
                    b: 35,
                    r: 10,
                    l: 50,
                },
            title: {
                text: `<b>Nombre d'accident par ${
                    variableKeyMap[selectedVariable1]["full_label"].toLowerCase()
                }</b>`,
                y: 0.98,
                x: 0.5,
                xanchor: 'center',
                yanchor: 'top',
                font: {
                    size: 20,
                    family: 'Arial, sans-serif',
                    color: theme.plotColors.title_color,
                }
            },
            xaxis: {
                showticklabels: true,
                color: theme.plotColors.xaxis_color,
                gridcolor: theme.plotColors.xaxis_grid_color,
                title: {
                    text: `${variableKeyMap[selectedVariable1]["full_label"]}`,
                },
                dtick: 1,
            },
            yaxis: {
                color: theme.plotColors.yaxis_color,
                gridcolor: theme.plotColors.yaxis_grid_color,
                title: {
                    text: "Nombre d'accidents",
                },
                //dtick: 1,
            },
            showlegend: false,
            legend: {
                font: {
                    color: theme.plotColors.legend_text_color,
                },
            }
        }
        // When modality labels are too long
        const varsWithLegend = [
            'obs', 'obsm', 'manv', 'trajet', 'atm', 'lum', 'mois'
        ]
        if(varsWithLegend.includes(selectedVariable1)){
            out.xaxis.showticklabels = false
            out.showlegend = true
        }
        return(out)
    }, [selectedVar1ValLabels, selectedVar1ValCounts, theme])

    /**
     * Function used to build labels on year slider.
     * @param {Array} uniqueYears Array of ordered unique years.
     * @returns Array of marker objects for MUI slider.
     */
    function buildSliderMarks(uniqueYears){
        let out = []
        for(let i=0;i<uniqueYears.length;i++){
            out.push(
                {value: Number(uniqueYears[i]), label: `${uniqueYears[i]}`}
            )
        }
        return(out)
    }

    /**
     * 
     * @param {Array[Number]} selectedYears 
     * @returns 
     */
    function buildFilterYearSet(selectedYears){
        let years = new Set()
        for(let i=selectedYears[0];i<=selectedYears[1];i++){
            years.add(i)
        }
        return(years)
    }
    
    const pieChartTraces = useMemo(() => {
            // TODO: Cache or precalc cat groups to save calculating it every time
            // TODO: Account for pies with no data
            let selectedYearSubsetIdx
            if(filterMap.size === 0 & idxFilterSet.size === 0)
                selectedYearSubsetIdx = getIndexesSet(
                    accidentData["an"],
                    selectedYearsSet
                )
            else if(filterMap.size > 0 & idxFilterSet.size === 0)
                selectedYearSubsetIdx = idxFilterSet
            else{
                selectedYearSubsetIdx = getIndexesSet(
                    accidentData["an"],
                    selectedYearsSet
                ).intersection(idxFilterSet)
            }
            let out = []
            let var1Indexes = getIndexesCategoricalSet(
                accidentData,
                variableKeyMap,
                selectedVariable1,
                selectedYearSubsetIdx
            )
            //console.log(`var1Indexes len: ${var1Indexes.size}`)
            //console.log(`v1: ${[...var1Indexes.entries()]}`)
            if(selectedVariable1 !== selectedVariable2){
                //let rowNb = 0
                //let colNb = 0
                let plotIdx = 0
                let plotPoseCol
                let plotPoseRow
                console.log(`pie trace switch val: ${selectedVariable1}`)
                switch(selectedVariable1){
                    case "age":
                        plotPoseCol = [0, 1, 0, 1]
                        plotPoseRow = [0, 0, 1, 1]
                        break;
                    case "atm":
                        plotPoseCol = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1]
                        plotPoseRow = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2]
                        break;
                    case "mois":
                        plotPoseCol = [3, 0, 2, 2, 1, 3, 0, 1, 2, 1, 3, 0]
                        plotPoseRow = [1, 1, 1, 2, 0, 2, 2, 2, 0, 1, 0, 0]
                        break;
                    case "jour":
                        plotPoseCol = [2 ,1, 0, 1, 0, 3, 2]
                        plotPoseRow = [0 ,1, 0, 0, 1, 0, 1]
                        break;
                    case "lum":
                        plotPoseCol = [0 ,1, 2, 3, 0]
                        plotPoseRow = [0 ,1, 0, 0, 1]
                        break;
                    case "grav":
                        plotPoseCol = [0 ,1, 0, 1]
                        plotPoseRow = [0 ,1, 1, 0]
                        break;
                    case "trajet":
                        plotPoseCol = [0, 1, 2, 3, 0, 1, 2]
                        plotPoseRow = [0, 0, 0, 0, 1, 1, 1]
                        break;
                    case "secuexist":
                        plotPoseCol = [0, 1, 0, 1]
                        plotPoseRow = [0, 0, 1, 1]
                        break;
                    case "obs":
                        plotPoseCol = [
                            0, 1, 2, 3, 4, 5, 
                            0, 1, 2, 3, 4, 5,
                            0, 1, 2, 3, 4, 5,
                            0
                        ]
                        plotPoseRow = [
                            0, 0, 0, 0, 0, 0,
                            1, 1, 1, 1, 1, 1,
                            2, 2, 2, 2, 2, 2,
                            3
                        ]
                        break;
                    case "obsm":
                        plotPoseCol = [0, 1, 2, 3, 0, 1, 2, 3]
                        plotPoseRow = [0, 0, 0, 0, 1, 1, 1, 1]
                        break;
                    case "manv":
                        plotPoseCol = [
                            0, 1, 2, 3, 4, 5, 
                            0, 1, 2, 3, 4, 5,
                            0, 1, 2, 3, 4, 5,
                            0, 1, 2, 3, 4, 5
                        ]
                        plotPoseRow = [
                            0, 0, 0, 0, 0, 0,
                            1, 1, 1, 1, 1, 1, 
                            2, 2, 2, 2, 2, 2,
                            3, 3, 3, 3, 3, 3
                        ]
                        break;
                    default:
                        plotPoseCol = [0, 1, 0, 1]
                        plotPoseRow = [0, 0, 1, 1]
                }
                    for(const [k1, v1] of var1Indexes){
                        let var2Indexes = getIndexesCategorical(
                                accidentData,
                                variableKeyMap,
                                selectedVariable2,
                                selectedYearSubsetIdx.intersection(v1)
                        )
                        //console.log(`var2Indexes len: ${var2Indexes.size}`)
                        //console.log(`v2: ${[...var2Indexes.entries()]}`)
                        let labels = []
                        let values = []
                        for(const [k2, v2] of var2Indexes){
                            labels.push(k2)
                            values.push(v2.length)
                        }
                        //console.log(`labels: ${labels}, values: ${values}`)
                        out.push({
                                labels: labels,
                                values: values,
                                name: k1,
                                text: k1,
                                textposition: 'inside',
                                hovertemplate: "Label: %{label}<br>"+
                                               "Nb accidents: %{value}",
                                hole: .6,
                                type: "pie",
                                domain: {
                                    column: plotPoseCol[plotIdx],
                                    row: plotPoseRow[plotIdx]
                                }
                            })
                        //console.log(`var: ${k1}, col: ${debug_plot_col[plotIdx]}, row: ${debug_plot_row[plotIdx]}`)
                        plotIdx ++
                    }
            }
            else{/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                out.push({
                    labels: selectedVar1ValLabels,
                    values: selectedVar1ValCounts,
                    type: 'pie',
                    name: variableKeyMap[selectedVariable1]["short_label"],
                    marker: {
                        colors: theme.plotColors.multi_line_color
                    },
                    hovertemplate: `%{label}<br>`+
                                   `Nombre: %{value}`,
                })
            }
            return(out)
        }, [accidentData, variableKeyMap, selectedVariable1, selectedVariable2, selectedVar1ValLabels, selectedVar1ValCounts, idxFilterSet])

    function distributeValues(a, b, n) {
      const interval = (b - a) / (n + 1);
      const values = [];
      for (let i = 1; i <= n; i++) {
        values.push(a + i * interval);
      }
      return values;
    }

    const pieChartLayout = useMemo(() => {
        if(selectedVariable1 === selectedVariable2){
            return({
                width: 1400,
                height: 600,
                plot_bgcolor: theme.plotColors.plot_bgcolor,
                paper_bgcolor: theme.plotColors.paper_bgcolor,
                legend:{
                    title: {
                        text: variableKeyMap[selectedVariable1]["full_label"],
                    },
                    font: {
                        color: theme.plotColors.legend_text_color,
                    },
                },
                margin: {
                    t: 50,
                    b: 35,
                    r: 50,
                    l: 50,
                },
                title: {
                    text: `<b>Proportion d'accidents cycliste en fonction de ${
                        variableKeyMap[selectedVariable2][
                            "full_label"
                        ].toLowerCase()}</b>`,
                    y: 0.98,
                    x: 0.5,
                    xanchor: 'center',
                    yanchor: 'top',
                    font: {
                        size: 20,
                        family: 'Aria,, sans-serif',
                        color: theme.plotColors.title_color,
                    }
                }
            })
        }
        let plotLabels
        if(Object.hasOwn(variableKeyMap[selectedVariable1], "keys")){
            plotLabels = Object.values(variableKeyMap[selectedVariable1]["keys"])
        }
        else if(Object.hasOwn(variableKeyMap[selectedVariable1], "cat_group")){
            plotLabels = Object.keys(variableKeyMap[selectedVariable1]["cat_group"])
        }
        // Scale grid to 16:9 + extra
        //let scalingFactor = Math.sqrt(plotLabels.length / (16*9))
        //let nbCols = Math.floor(scalingFactor * 16)
        //let nbRows = Math.floor(scalingFactor * 9)
        //let remainder = (nbCols % 1) + (nbRows % 1)
        //let missing = plotLabels.length - (
        //    Math.floor(nbCols) * Math.floor(nbRows)
        //)
        //if(missing > 0){
        //    nbRows ++
        //}
        let annotations = []
        //let colIdx = 0
        //let rowIdx = 0
        //let idx = 0
        //console.log(`line val: ${distributeValues(0,1,2)}`)
        //let colPos = distributeValues(0, 1, nbCols)
        //let rowPos = distributeValues(0, 1, nbRows)
        //let posScaleVal = 1.2
        //function calcLabelPos(plotLabels){
        // TODO: Make this procedural
        let xPos
        let yPos
        let nbCols
        let nbRows
        let inCircleFontSize
        let inCircleWeight
        console.log(`Selected variable: ${selectedVariable1}`)
        switch(selectedVariable1){
            case "atm":
                xPos = [
                    0.091, 0.372, 0.627, 0.908,
                    0.088, 0.372, 0.628, 0.908,
                    0.098, 0.373
                ]
                yPos = [
                    0.865, 0.882, 0.88, 0.875,
                    0.5, 0.5, 0.5, 0.5,
                    0.135, 0.13
                ]
                nbCols = 4
                nbRows = 3
                inCircleFontSize = [12,10,8,5]
                break;
            case "mois":
                xPos = [
                    0.9, 0.1, 0.627, 0.628,
                    0.372, 0.92, 0.078, 0.372,
                    0.628, 0.372, 0.9, 0.09
                ]
                yPos = [
                    0.5, 0.5, 0.5, 0.135,
                    0.87, 0.135, 0.135, 0.135,
                    0.87, 0.5, 0.87, 0.87
                ]
                nbCols = 4
                nbRows = 3
                inCircleFontSize = 15
                break;
            case "jour":
                xPos = [
                    0.628, 0.372, 0.087, 0.372,
                    0.066, 0.915, 0.63
                ]
                yPos = [
                    0.8, 0.21, 0.8, 0.8,
                    0.21, 0.8, 0.21
                ]
                nbCols = 4
                nbRows = 2
                inCircleFontSize = 25
                break;
            case "lum":
                xPos = [0.112, 0.5, 0.887, 0.5, 0.112]
                yPos = [0.79, 0.18, 0.835, 0.86, 0.126]
                nbCols = 3
                nbRows = 2
                inCircleFontSize = 20
                break;
            case "grav":
                xPos = [0.19, 0.782, 0.183, 0.795]
                yPos = [0.79, 0.21, 0.2, 0.82]
                nbCols = 2
                nbRows = 2
                inCircleFontSize = 20
                break;
            case "sexe":
                xPos = [0.13, 0.86]
                yPos = [0.5, 0.5]
                nbCols = 2
                nbRows = 1
                inCircleFontSize = 50
                break;
            case "age":
                xPos = [0.19, 0.81, 0.188, 0.815]
                yPos = [0.82, 0.82, 0.19, 0.19]
                nbCols = 2
                nbRows = 2
                inCircleFontSize = 20
                break;
            case "trajet":
                xPos = [
                    0.07, 0.373, 0.63, 0.93,
                    0.07, 0.372, 0.63, -1
                ]
                yPos = [
                    0.82, 0.82, 0.82, 0.82,
                    0.19, 0.19, 0.21, -1
                ]
                nbCols = 4
                nbRows = 2
                inCircleFontSize = 20
                break;
            case "secuexist":
                xPos = [
                    0.187, 0.8,
                    0.2, 0.805,-1
                ]
                yPos = [
                    0.79, 0.82,
                    0.19, 0.19,-1
                ]
                nbCols = 2
                nbRows = 2
                inCircleFontSize = 20
                break;
            case "obs":
                xPos = [
                    0.051, 0.212, 0.415, 0.585, 0.775, 0.945,
                    0.054, 0.219, 0.415, 0.585, 0.775, 0.942,
                    0.051, 0.225, 0.415, 0.585, 0.777, 0.949,
                    0.053
                ]
                yPos = [
                    0.9, 0.94, 0.9, 0.91, 0.91, 0.91,
                    0.63, 0.63, 0.63, 0.63, 0.63, 0.63,
                    0.37, 0.38, 0.375, 0.39, 0.37, 0.38,
                    0.095
                ]
                nbCols = 6
                nbRows = 4
                inCircleFontSize = 9
                break;
            case "obsm":
                xPos = [
                    0.085, 0.373, 0.67, 0.92,
                    0.063, 0.373, 0.63, 0.93,
                ]
                yPos = [
                    0.79, 0.79,  0.79, 0.82,
                    0.19, 0.19, 0.21, 0.19
                ]
                nbCols = 4
                nbRows = 2
                inCircleFontSize = 20
                break;
            case "manv":
                xPos = [
                    0.054, 0.217, 0.415, 0.585, 0.779, 0.95,
                    0.048, 0.223, 0.415, 0.585, 0.779, 0.946,
                    0.057, 0.223, 0.415, 0.585, 0.774, 0.945,
                    0.053, 0.221, 0.415, 0.585,
                    -1, -1, -1, -1, -1, -1
                ]
                yPos = [
                    0.9, 0.94, 0.915, 0.91, 0.91, 0.91,
                    0.63, 0.63, 0.63, 0.63, 0.63, 0.63,
                    0.37, 0.38, 0.375, 0.37, 0.37, 0.37,
                    0.104, 0.08, 0.088, 0.095,
                    -1, -1, -1, -1, -1, -1
                ]
                nbCols = 6
                nbRows = 4
                inCircleFontSize = 9
                break;
            default:
                xPos = [0.19, 0.815, 0.185, 0.805]
                yPos = [0.79, 0.79, 0.22, 0.22]
                nbCols = 2
                nbRows = 2
                inCircleFontSize = 20
        }
        //return([xPos, yPos])
        //}
        //let labelPos = calcLabelPos(plotLabels)
        for(let idx=0;idx<plotLabels.length;idx++){
            annotations.push(
                {
                  font: {
                    size: inCircleFontSize,
                    color: theme.plotColors.title_color
                  },
                  showarrow: false,
                  text: insertLineBreaks(plotLabels[idx], 10),
                  x: xPos[idx]/*labelPos[0][idx]*/,
                  y: yPos[idx]/*labelPos[1][idx]*/
                  //x: colPos[idx % nbCols] * posScaleVal,
                  //y: (1 - rowPos[Math.floor(idx / nbCols)]) * posScaleVal
                }
            )
            //console.log(`idx: ${idx}, x pos: ${(idx % (nbCols))}`)
            //console.log(`idx: ${idx}, colPos: ${idx % nbCols}, rowPos: ${idx / nbCols}`)
            //idx++
        }
        //(max - min)
        //console.log(`nb Cols: ${nbCols}, nb rows: ${nbRows}`)
        //console.log(`multi: ${
        //    Math.floor(scalingFactor * 16) * Math.floor(scalingFactor * 9)
        //}, missing: ${missing}`)
        //console.log(`multi: ${Math.floor(nbCols) * Math.floor(nbRows)}`)
        return({
                width: 1400,
                height: 600,
                plot_bgcolor: theme.plotColors.plot_bgcolor,
                paper_bgcolor: theme.plotColors.paper_bgcolor,
                legend:{
                    title: {
                        text: variableKeyMap[selectedVariable2]["full_label"],
                    },
                    font: {
                        color: theme.plotColors.legend_text_color,
                    },
                },
                margin: {
                    t: 50,
                    b: 35,
                    r: 50,
                    l: 50,
                },
                title: {
                    text: `<b>Proportion d'accidents cycliste en fonction de ${
                        variableKeyMap[selectedVariable1][
                            "full_label"
                        ].toLowerCase()} et de ${
                        variableKeyMap[selectedVariable2][
                            "full_label"
                        ].toLowerCase()
                    }</b>`,
                    y: 0.98,
                    x: 0.5,
                    xanchor: 'center',
                    yanchor: 'top',
                    font: {
                        size: 20,
                        family: 'Aria,, sans-serif',
                        color: theme.plotColors.title_color,
                    }
                },
                annotations: annotations,
                grid: {rows: nbRows, columns: nbCols}
        })
    }, [variableKeyMap, selectedVariable1, selectedVariable2, idxFilterSet, theme])

    return(
            <div id="temporalPageRootDiv">
                {
                //<h1>Description des accidents et état/situation des usagers mis en cause</h1>
                }
                <div id="mainTemporalGraphDiv">
                    <span id="topGraphSpan">
                        <div>
                            <Plot
                                onClick={(data) => {console.log(`nb points: ${data.points[0]}`)}}
                                data={stackedPlotTraces}
                                layout={stackedPlotLayout}
                            />
                        </div>
                        <div>
                            {//console.log(`bar plot traces: ${JSON.stringify(barPlotTraces)}`)
                            }
                            <Plot
                            data={barPlotTraces}
                            layout={barPlotLayout}
                        />
                        </div>
                    </span>
                    <div id="controlsDiv">
                        <div id='sliderDiv'>
                            <h4>Années sélectionné: {selectedYears[0]}, {selectedYears[1]}</h4>
                            <Slider
                                onChangeCommitted={(event, value) => {
                                    setSelectedYears(value)
                                }}
                                //track={false}
                                defaultValue={[Math.min(...uniqueYears),
                                               Math.max(...uniqueYears)]}
                                marks={buildSliderMarks(uniqueYears)}
                                //step={uniqueYears.length}
                                max={Math.max(...uniqueYears)}
                                min={Math.min(...uniqueYears)}
                                //valueLabelDisplay="off"
                            />
                        </div>
                        <div id="varDropdownDiv">
                            <span id='varDropdownSpan'>
                                <div>
                                    <InputLabel className='varLabel'>
                                        Variable 1
                                    </InputLabel>
                                    <Select
                                        className='varSelectDropdown'
                                        size="small"
                                        value={selectedVariable1}
                                        onChange={
                                            (event) => { 
                                                setSelectedVariable1(
                                                    event.target.value
                                                )
                                            }
                                        }
                                    >
                                        {
                                            categoricalVariables.map(
                                                (item, idx) => (
                                                    <MenuItem
                                                        key={idx}
                                                        value={item}
                                                    >
                                                        {variableKeyMap[item]['full_label']}
                                                    </MenuItem>
                                                )
                                            )
                                        }
                                    </Select>
                                </div>
                                <div>
                                    <InputLabel className='varLabel'>
                                        Variable 2
                                    </InputLabel>
                                    <Select
                                        className='varSelectDropdown'
                                        size="small"
                                        value={selectedVariable2}
                                        onChange={
                                            (event) => { 
                                                setSelectedVariable2(
                                                    event.target.value
                                                )
                                            }
                                        }
                                    >
                                        {
                                            categoricalVariables.map(
                                                (item, idx) => (
                                                    <MenuItem
                                                        key={idx}
                                                        size="small"
                                                        value={item}
                                                    >
                                                        {variableKeyMap[item]['full_label']}
                                                    </MenuItem>
                                                )
                                            )
                                        }
                                    </Select>
                                </div>
                            </span>
                        </div>
                    </div>
                    <div>
                        <Plot
                            data={pieChartTraces}
                            layout={pieChartLayout}
                        />
                    </div>
                </div>
            </div>  
        )
}