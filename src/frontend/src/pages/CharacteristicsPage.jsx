import { useState, useEffect, useMemo } from 'react'
import { useTheme } from "@mui/material/styles"
import Slider from '@mui/material/Slider';
import {Select, MenuItem, InputLabel} from "@mui/material";
import Plot from 'react-plotly.js'
import { getIndexes,
         filterByValues,
         monthList,
         countValues,
         rollingAverage,
         calculateSeasonalData,
         concatSeasonalData,
         calcResidualsData,
         countValuesWithSubset,
         groupDataIdx,
         getCatPlotValsAndLabs,
         groupDataCount,
         getIndexesCategorical,
         getIndexesSet,
         getIndexContinuBracket,
         getIndexesCategoricalSet,
         groupDataIdxSet
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
                                             uniqueVariablesTemp,}){
    
    const theme = useTheme();

    // DEBUG
    /*
    let accidentDataTemp ={
        an:     [2025,      2026,   2024,   2026,   2023,   2026,   2025,      2026,   2024,   2026,   2023,   2026,    2024],
        grav:   [2,         2,      4,      3,      1,      2,      2,         2,      2,      3,      1,      2,       1],
        mois:   ["juillet", "juin", "mai", "avril", "juin", "juin", "juillet", "juin", "mai", "avril", "juin", "juin", "septembre"],
        age:    [20,        20,     30,     30,     30,     16,     30,         30,     25,    26,      65,     68,     65],
    }
    
    let variableKeyMapTemp = {
        grav: {
            keys: {"1": "Indemne", "2": "Tué", "3": "Blessé hospitalisé", "4": "Blessé léger"},
            full_label: "Gravité de blessure de l'usager",
            short_label: "Gravité",
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
    //let uniqueYearsTemp = [... new Set(accidentData.an)].sort()

    let uniqueVariables = Object.keys(variableKeyMap)

    let categoricalVariables = []

    let continuousVariables = []

    for(const key of uniqueVariables){
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

    //const [selectedYearIndexes]

    //const [selectedVariable, setSelectedVariable] = useState("grav");

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

    const [selectedVar1UniqueValues, setSelectedVar1UniqueValues] = useState(
        new Array()
    );
    
    useEffect(() => {
        setSelectedVar1ValLabels([...selectedVar1IndexMap2.keys()])
        let valueCounts = new Array()
        for(const set of selectedVar1IndexMap2.values()){
            valueCounts.push(set.size)
        }
        setSelectedVar1ValCounts(valueCounts)
    }, [selectedYearsIndexSet, selectedVariable1]);


    const stackedPlotTraces = useMemo(() => {
        //console.log("Entered: stackedPlotTraces useMemo!")
            let out = []
            let filterMap = new Map()
            let yearHoverLabel = selectedYears[0] === selectedYears[1] ? selectedYears[1] : 
                `${selectedYears[0]}, ${selectedYears[1]}`
            let variableKeyValues = [...selectedVar1IndexMap2.keys()]
            //console.log(`variableKeyValues: ${variableKeyValues}`)
            for(let i=0;i<selectedVar1IndexMap2.size;i++){
                let monthCount = new Array(monthList.length)
                for(let monthIdx=0;monthIdx<monthList.length;monthIdx++){
                    monthCount[monthIdx] = getIndexes(
                        accidentData['mois'],
                        monthList[monthIdx],
                        selectedVar1IndexMap2.get(variableKeyValues[i])
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
                    name: variableKeyValues[i],//`${variableValues[i]}`,
                    hovertemplate: `Mois: %{x}<br>`+
                                   `Nombre: %{y}<br>`+
                                   `Année: ${yearHoverLabel}`,
                })
            }
            //console.log(`stacked data: ${JSON.stringify(out)}`)
            return(out)
        }, [selectedYears, selectedVariable1]);

    const stackedPlotLayout = useMemo(() => {
        return(
            {
                //width: 320,
                //height: 240,
                plot_bgcolor: theme.plotColors.plot_bgcolor,
                paper_bgcolor: theme.plotColors.paper_bgcolor,
                margin: {
                    t: 30,
                    b: 50,
                    r: 20,
                    l: 50,
                },
                legend:{
                    title: {
                            text: variableKeyMap[selectedVariable1]["full_label"],
                        },
                        font: {
                            color: theme.plotColors.legend_text_color,
                        },
                    },
                title: {
                    text: `<b>Nombre d'accidents par ${
                        variableKeyMap[selectedVariable1]["full_label"].toLowerCase()
                    } années ${selectedYears[0]}-${selectedYears[1]}</b>`,
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
    }, [selectedVariable1, selectedYears])

    const barPlotTraces = useMemo(() => {
            return([
                {
                    x: selectedVar1ValLabels,
                    y: selectedVar1ValCounts,
                    type: 'bar',
                    //mode: 'lines+markers',
                    marker: {
                        color: theme.plotColors.multi_line_color
                    },
                    name: "Nombre d'accident",
                    hovertemplate: `Blessure: %{x}<br>`+
                                   `Nombre: %{y}`,
                }
            ])
        }, [selectedVar1ValLabels, selectedVar1ValCounts])

    /**
     * 
     * @param {Array} uniqueYears 
     * @returns 
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
            let selectedYearSubsetIdx = getIndexesSet(
                accidentData["an"],
                selectedYearsSet
            )
            let out = []
            let var1Indexes = getIndexesCategoricalSet(
                accidentData,
                variableKeyMap,
                selectedVariable1,
                selectedYearSubsetIdx
            )
            //console.log(`v1: ${[...var1Indexes.entries()]}`)
            if(selectedVariable1 !== selectedVariable2){
                //let rowNb = 0
                //let colNb = 0
                let plotIdx = 0
                let debug_plot_col = [0, 1, 0, 1]
                let debug_plot_row = [0, 0, 1, 1]
                // Calc col positions
                for(const [k1, v1] of var1Indexes){
                    let var2Indexes = getIndexesCategorical(
                            accidentData,
                            variableKeyMap,
                            selectedVariable2,
                            selectedYearSubsetIdx.intersection(v1)
                    )
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
                                           "value: %{value}",
                            hole: .6,
                            type: "pie",
                            domain: {
                                column: debug_plot_col[plotIdx],
                                row: debug_plot_row[plotIdx]
                            }
                        })
                    //console.log(`var: ${k1}, col: ${debug_plot_col[plotIdx]}, row: ${debug_plot_row[plotIdx]}`)
                    plotIdx ++
                }
            }
            else{
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
        }, [accidentData, variableKeyMap, selectedVariable1, selectedVariable2, selectedVar1ValLabels, selectedVar1ValCounts])

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
        let scalingFactor = Math.sqrt(plotLabels.length / (16*9))
        let nbCols = Math.floor(scalingFactor * 16)
        let nbRows = Math.floor(scalingFactor * 9)
        //let remainder = (nbCols % 1) + (nbRows % 1)
        let missing = plotLabels.length - (
            Math.floor(nbCols) * Math.floor(nbRows)
        )
        if(missing > 0){
            nbRows ++
        }
        let annotations = []
        //let colIdx = 0
        //let rowIdx = 0
        //let idx = 0
        //console.log(`line val: ${distributeValues(0,1,2)}`)
        //let colPos = distributeValues(0, 1, nbCols)
        //let rowPos = distributeValues(0, 1, nbRows)
        //let posScaleVal = 1.2
        function calcLabelPos(plotLabels){
            // TODO: Make this procedural
            let xPos
            let yPos 
            switch(selectedVariable1){
                case "age":
                    xPos = [0.19, 0.815, 0.185, 0.805]
                    yPos = [0.79, 0.79, 0.22, 0.22]
                    break;
                default:
                    xPos = [0.19, 0.815, 0.185, 0.805]
                    yPos = [0.79, 0.79, 0.22, 0.22]
            }
            return([xPos, yPos])
        }
        let labelPos = calcLabelPos(plotLabels)
        for(let idx=0;idx<plotLabels.length;idx++){
            annotations.push(
                {
                  font: {
                    //size: 0,
                    color: theme.plotColors.title_color
                  },
                  showarrow: false,
                  text: plotLabels[idx],
                  x: labelPos[0][idx],
                  y: labelPos[1][idx]
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
    }, [variableKeyMap, selectedVariable1, selectedVariable2])

    return(
            <div id="temporalPageRootDiv">
                <h1>Description des accidents et état/situation des usagers mis en cause</h1>
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
                            layout={ {
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
                                }
                            } }
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
                                    <InputLabel>
                                        Variable 1
                                    </InputLabel>
                                    <Select
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
                                    <InputLabel>
                                        Variable 2
                                    </InputLabel>
                                    <Select
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