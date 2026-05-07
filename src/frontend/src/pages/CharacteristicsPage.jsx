import { useState, useEffect } from 'react'
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
         getIndexesSet
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
export default function CharacteristicsPage({uniqueYearsTemp,
                                             accidentDataTemp,
                                             variableKeyMapTemp,
                                             uniqueVariablesTemp,}){
    
    const theme = useTheme();

    // DEBUG
    let accidentData ={
        an:     [2025,      2026,   2024,   2026,   2023,   2026,   2025,      2026,   2024,   2026,   2023,   2026,    2024],
        grav:   [2,         2,      2,      3,      1,      2,      2,         2,      2,      3,      1,      2,       1],
        mois:   ["juillet", "juin", "mai", "avril", "juin", "juin", "juillet", "juin", "mai", "avril", "juin", "juin", "septembre"],
        age:    [20,        20,     30,     30,     30,     30,     30,         30,     25,    26,      65,     68,     65],
    }
    
    let variableKeyMap = {
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

    let uniqueYears = [... new Set(accidentData.an)].sort()

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

    const [selectedYearsSet, setSelectedYearsSet] = useState(
        buildFilterYearSet(selectedYears)
    );

    const [selectedYearsIndexes, setSelectedYearsIndexes] = useState(
        getIndexes(
            accidentData["an"],
            buildFilterYearSet(selectedYears)
        )
    );

    //const [selectedYearIndexes]

    //const [selectedVariable, setSelectedVariable] = useState("grav");

    const [selectedVariable1, setSelectedVariable1] = useState("age");

    const [selectedVariable2, setSelectedVariable2] = useState("grav");

    const [selectedVar1IndexMap, setSelectedVar1IndexMap] = useState(
        new Map()
    );

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
        setSelectedYearsSet(buildFilterYearSet(selectedYears))
        setSelectedYearsIndexes(
            getIndexes(
                accidentData["an"],
                buildFilterYearSet(selectedYears)
            )
        )
    }, [selectedYears]);

    useEffect(() => {
        for(const key of selectedVar1IndexMap.keys()){
            selectedVar1IndexMap.delete(key)
        }
        for(const [k,v] of getIndexesCategorical(
                accidentData,
                variableKeyMap,
                selectedVariable1,
                selectedYearsIndexes
            )){
                selectedVar1IndexMap.set(k,v)
            }
        setSelectedVar1ValLabels([...selectedVar1IndexMap.keys()])
        let valueCounts = new Array()
        for(const set of selectedVar1IndexMap.values()){
            valueCounts.push(set.length)
        }
        setSelectedVar1ValCounts(valueCounts)
    }, [selectedYearsIndexes, selectedVariable1, selectedYears]);

    function buildStackedLinePlotDataArray(data,
                                           monthList,
                                           selectedYears,
                                           //selectedVariable,
                                           //variableKeyMap,
                                           selectedVarIndexMap){
        let out = []
        let filterMap = new Map()
        //console.log(`selecte var map: ${[...selectedVarIndexMap.entries()]}`)
        //console.log(`var name: ${selectedVarUniqueValues}`)
        //if(Object.hasOwn(variableKeyMap[selectedVariable], "keys"))
        //let variableKeys = Object.keys(variableKeyMap[
        //    selectedVariable
        //]["keys"])
        //let variableKeys = [...selectedVarIndexMap.keys()]
        //let variableValues = Object.values(
        //    variableKeyMap[`${selectedVariable}`]["keys"]
        //)
        //let variableValues = [...selectedVarIndexMap.values()]
        //filterMap.set("an", selectedYearsIndexes)
        let yearHoverLabel = selectedYears[0] === selectedYears[1] ? selectedYears[1] : 
            `${selectedYears[0]}, ${selectedYears[1]}`
        let variableKeyValues = [...selectedVarIndexMap.keys()]
        for(let i=0;i<selectedVarIndexMap.size;i++){
            let monthCount = new Array(monthList.length)
            for(let monthIdx=0;monthIdx<monthList.length;monthIdx++){
                monthCount[monthIdx] = getIndexes(
                    data['mois'],
                    monthList[monthIdx],
                    selectedVarIndexMap.get(variableKeyValues[i])
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
        return(out)



        //for(let i=0;i<variableKeys.length;i++){
        //    filterMap.set(
        //        selectedVariable,
        //        Number(variableKeys[i])
        //    )
        //    for(let j=0;j<monthList.length;j++){
        //        filterMap.set("mois", monthList[j])
        //        let debugCount = filterByValues(accidentData, filterMap).length
        //        monthCount[j] = debugCount
        //    }
        //    out.push({
        //        x: monthList,
        //        y: monthCount,
        //        type: 'scatter',
        //        //stackgroup: 'one',
        //        //fill: 'toself',
        //        marker: {
        //            color: theme.plotColors.multi_line_color[i],
        //        },
        //        name: `${variableValues[i]}`,
        //        hovertemplate: `Mois: %{x}<br>`+
        //                       `Nombre: %{y}<br>`+
        //                       `Année: ${selectedYearsIndexes}`,
        //    })
        //    monthCount = new Array(monthList.length)
        //}
        //return(out)
    }

    function buildBarPlotData(selectedVarValLabels, selectedVarValCounts){
        return([
            {
                x: selectedVarValLabels,
                y:selectedVarValCounts,
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
    }

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

    /**
     * 
     * @param {*} data 
     * @param {*} variableKeyMap 
     * @param {*} var1 
     * @param {*} var2 
     * @param {*} selectedYearSubsetIdx 
     * @returns 
     */
    function buildPieChartData(data,
                               variableKeyMap,
                               var1,
                               var2,
                               selectedYearSubsetIdx,
                            selectedVar1ValLabels,
                        selectedVar1ValCounts){
        // TODO: Cache or precalc cat groups to save calculating it every time
        // TODO: Account for pies with no data
        let out = []
        let var1Indexes = getIndexesCategorical(
            data,
            variableKeyMap,
            var1,
            selectedYearSubsetIdx
        )
        //console.log(`v1: ${[...var1Indexes.entries()]}`)
        if(var1 !== var2){
            //let rowNb = 0
            //let colNb = 0
            let plotIdx = 0
            let debug_plot_col = [0, 1, 0, 1]
            let debug_plot_row = [0, 0, 1, 1]
            // Calc col positions
            for(const [k1, v1] of var1Indexes){
                let var2Indexes = getIndexesCategorical(
                        data,
                        variableKeyMap,
                        var2,
                        new Set(selectedYearSubsetIdx).intersection(new Set(v1))
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
                name: variableKeyMap[var1]["short_label"],
                marker: {
                    colors: theme.plotColors.multi_line_color
                },
                hovertemplate: `%{label}<br>`+
                               `Nombre: %{value}`,
            })
        }
        return(out)
    }

    function distributeValues(a, b, n) {
      const interval = (b - a) / (n + 1);
      const values = [];
      for (let i = 1; i <= n; i++) {
        values.push(a + i * interval);
      }
      return values;
    }

    function buildPieChartLayout(variableKeyMap, var1, var2){
        if(var1 === var2){
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
        if(Object.hasOwn(variableKeyMap[var1], "keys")){
            plotLabels = Object.values(variableKeyMap[var1]["keys"])
        }
        else if(Object.hasOwn(variableKeyMap[var1], "cat_group")){
            plotLabels = Object.keys(variableKeyMap[var1]["cat_group"])
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
        let colPos = distributeValues(0, 1, nbCols)
        let rowPos = distributeValues(0, 1, nbRows)
        let posScaleVal = 1.2
        for(let idx=0;idx<plotLabels.length;idx++){
            annotations.push(
                {
                  font: {
                    //size: 0,
                    color: theme.plotColors.title_color
                  },
                  showarrow: false,
                  text: plotLabels[idx],
                  x: 0.82,
                  y: 0.22
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
    }

    return(
            <div id="temporalPageRootDiv">
                <h1>Description des accidents et état/situation des usagers mis en cause</h1>
                <div id="mainTemporalGraphDiv">
                    <span id="topGraphSpan">
                        <div>
                            <Plot
                                onClick={(data) => {console.log(`nb points: ${data.points[0]}`)}}
                                data={
                                    buildStackedLinePlotDataArray(
                                        accidentData,
                                        monthList,
                                        selectedYears,
                                        //selectedVariable1,
                                        //variableKeyMap,
                                        //selectedVarValLabels,
                                        selectedVar1IndexMap
                                    )
                                }
                                layout={ {
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
                                        dtick: 1
                                    }
                                } }
                            />
                        </div>
                        <div>
                            <Plot
                            data={
                                buildBarPlotData(
                                    selectedVar1ValLabels,
                                    selectedVar1ValCounts
                                )
                                //{
                                //    x: selectedVar1ValLabels,
                                //    y: countValuesWithSubset(
                                //        accidentData,
                                //        selectedVar1UniqueValues,
                                //        selectedVariable1,
                                //        new Set(getIndexes(
                                //            accidentData["an"],
                                //            selectedYearsSet
                                //        )) // FIX THIS MESS
                                //    ),
                                //    type: 'bar',
                                //    //mode: 'lines+markers',
                                //    marker: {
                                //        color: theme.plotColors.multi_line_color
                                //    },
                                //    name: "Nombre d'accident",
                                //    hovertemplate: `Blessure: %{x}<br>`+
                                //                   `Nombre: %{y}`,
                                //},
                            }
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
                                    dtick: 1,
                                }
                            } }
                        />
                        </div>
                    </span>
                    <div id="controlsDiv">
                        <div id='sliderDiv'>
                            <h4>{selectedYears[0]}, {selectedYears[1]}</h4>
                            <Slider
                                onChange={(event, value) => {
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
                                        test label
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
                                                        {item}
                                                    </MenuItem>
                                                )
                                            )
                                        }
                                    </Select>
                                </div>
                                <div>
                                    <InputLabel>
                                        test label 2
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
                                                        {item}
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
                        {//console.log("---------------------start--------------------------")
                        }
                        {//console.log(
                        //    getCatPlotValsAndLabs(
                        //        accidentData,
                        //        variableKeyMap,
                        //        "age",
                        //        Array.from(selectedYearsIdx)
                        //    )
                        //)
                        }
                        {//console.log("-----------------------pie-------------------------")
                        }
                        {
                            
                            //console.log(
                            //buildPieChartData(accidentData,
                            //        variableKeyMap,
                            //        "age",
                            //        "grav",
                            //        selectedYearsIdx
                            //    )
                            //)
                        }
                        {//console.log("---------------------end---------------------------")
                        }
                        {//console.log(selectedYearsIdx)
                        }
                        <Plot
                            data={
                                buildPieChartData(
                                    accidentData,
                                    variableKeyMap,
                                    selectedVariable1,
                                    selectedVariable2,
                                    getIndexes(accidentData["an"],
                                               selectedYearsSet), // FIX THIS MESS
                                    selectedVar1ValLabels,
                                    selectedVar1ValCounts
                                )
                            }
                            layout={
                                buildPieChartLayout(
                                variableKeyMap,
                                selectedVariable1,
                                selectedVariable2
                                )
                            }
                        />
                    </div>
                </div>
            </div>  
        )
}