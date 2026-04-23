import { useState, useEffect } from 'react'
import { useTheme } from "@mui/material/styles"
import Popover from '@mui/material/Popover';
import Plot from 'react-plotly.js'
import { getIndexes,
         filterByValues,
         monthList,
         countValues,
         rollingAverage,
         calculateSeasonalData,
         concatSeasonalData,
         calcResidualsData } from "../utils"
import "./TemporalPage.css"
import { darkTheme, lightTheme } from '../themes'


export default function TemporalPage({uniqueYears,
                                      accidentDataTemp,}){
    
    const theme = useTheme();
    
    // DEBUG
    let accidentData ={
        an:     [2025,      2026,   2024,   2026,   2023,   2026, 2025,      2026,   2024,   2026,   2023,   2026, 2024],
        grav:   [2,         2,      2,      3,      1,      2, 2,         2,      2,      3,      1,      2,       1],
        mois:   ["juillet", "juin", "mai", "avril", "juin", "juin", "juillet", "juin", "mai", "avril", "juin", "juin", "septembre"],
    }

    const [selectedYear, setSelectedYear] = useState(
        Math.max(...accidentData.an)
    );

    const [selectedYearIndexes, setSelectedYearIndexes] = useState(
        getIndexes(accidentData.an, selectedYear)
    );

    const [nbAccidentsSelectedYear, setNbAccidentsSelectedYear] = useState();

    const [nbDeathsSelectedYear, setNbDeathsSelectedYear] = useState();

    const [nbHospitalizedSelectedYear,
           setNbHospitalizationSelectedYear] = useState();

    // Full data plot
    const [fullTimePlotAllXLabels, setFullTimePlotAllXLabels] = useState([]);

    const [fullTimePlotAllYData, setFullTimePlotAllYData] = useState([]);

    const [fullTimePlotSmoothedData,
           setFullTimePlotSmoothedData] = useState([]);

    const [fullTimePlotSeasonalData,
           setFullTimePlotSeasonalData] = useState([]);

    const [fullTimePlotResidualData,
           setFullTimePlotResidualData] = useState([]);

    // Popover handlers
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
      setAnchorEl(null);
    };
    const open = Boolean(anchorEl);

    // All elements that depend on selected year
    useEffect(() => {
        setSelectedYearIndexes(getIndexes(accidentData.an, selectedYear))
        setNbAccidentsSelectedYear(selectedYearIndexes.length)
        let validGravValues = selectedYearIndexes.map(x=>accidentData.grav[x])
        setNbDeathsSelectedYear(
            getIndexes(validGravValues, 2).length
        )
        setNbHospitalizationSelectedYear(
            getIndexes(validGravValues, 3).map(x=>accidentData.grav[x]).length
        )
    }, [selectedYear]);

    // Build month year data plot
    useEffect(() => {
        let plotData = buildFullTimelineCountData(
            monthList,
            // TODO: Replace with component parameter
            [... new Set(accidentData.an)].sort()
        )
        setFullTimePlotAllXLabels(plotData[0])
        setFullTimePlotAllYData(plotData[1])
        let smoothedData = new Array(plotData[0].length)
        let averageData = rollingAverage(plotData[1], 6)
        setFullTimePlotSmoothedData(averageData)
        let seasonalData = concatSeasonalData(
            calculateSeasonalData(
                accidentData,
                monthList,
                [... new Set(accidentData.an)].sort()
            ),
            [... new Set(accidentData.an)].sort().length
        )
        setFullTimePlotSeasonalData(seasonalData)
        let residualData = calcResidualsData(
            plotData[1],
            averageData,
            seasonalData
        )
        //console.log(`season data: ${fullTimePlotSeasonalData}`)
        setFullTimePlotResidualData(residualData)
    }, [accidentDataTemp]);

    /**
     * Calculates the values and the x axis labels for the full timeline plot.
     * @param {Array} monthList Array of months ordered months.
     * @param {Array} uniqueYears Array of unique years present in the data.
     * @returns List with array of labels as first position and array of values
     *  as second position.
     */
    function buildFullTimelineCountData(monthList, uniqueYears){
        let arrayLength = monthList.length * uniqueYears.length
        let labels = new Array(arrayLength)
        let data = new Array(arrayLength)
        let filterMap = new Map()
        for(let i=0;i<uniqueYears.length;i++){
            filterMap.set("an", uniqueYears[i])
            for(let j=0;j<monthList.length;j++){
                filterMap.set("mois", monthList[j])
                labels[(i*monthList.length)+j] = `${uniqueYears[i]}-${monthList[j]}`
                data[(i*monthList.length)+j] = filterByValues(
                    accidentData,
                    filterMap
                ).length
            }
        }
        return([labels, data])
    }

    // DEBUG
    //console.log(`Selected year: ${selectedYear}`)
    //console.log(`Number accidents this year: ${nbAccidentsSelectedYear}`)
    //console.log(`Number hospital this year: ${nbHospitalizedSelectedYear}`)
    //console.log(`${getIndexes(selectedYearIndexes.map(x=>data.grav[x]), 3).map(x=>data.grav[x]).length}`)

    let testMap = new Map()
    testMap.set("an", 2026)
    testMap.set("grav", 2)

    return(
        <div id="temporalPageRootDiv">
            <div id="keyNumbersDiv">
                <span id="keyNumbersParentSpan">
                    <div className='keyNumbersElementDiv'>
                        <span>
                            Nombre d'accidents recensés en {selectedYear}:
                        </span>
                        <span 
                            className='keyNumberSpan' 
                            aria-owns={open ? 'mouse-over-popover' : undefined}
                            aria-haspopup="true"
                            onMouseEnter={handlePopoverOpen}
                            onMouseLeave={handlePopoverClose}
                        >
                            {nbAccidentsSelectedYear}
                            <Popover
                                id="mouse-over-popover"
                                sx={{ pointerEvents: 'none' }}
                                open={open}
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                }}
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'left',
                                }}
                                onClose={handlePopoverClose}
                                disableRestoreFocus
                            >
                                Popover text
                            </Popover>
                        </span>
                    </div>
                    <div className='keyNumbersElementDiv'>
                        <span>
                            Nombre de morts en {selectedYear}:
                        </span>
                        <span className='keyNumberSpan'>
                            {nbDeathsSelectedYear}
                        </span>
                        <span>
                            Représente {
                                ((nbDeathsSelectedYear/
                                nbAccidentsSelectedYear)*100).toFixed(2)
                            }% des accidents totaux.
                        </span>
                    </div>
                    <div className='keyNumbersElementDiv'>
                        <span>
                            Nombre d'hospitalisations en {selectedYear}:
                        </span>
                        <span className='keyNumberSpan'>
                            {nbHospitalizedSelectedYear}
                        </span>
                        <span>
                            Représente {
                                ((nbHospitalizedSelectedYear/
                                nbAccidentsSelectedYear)*100).toFixed(2)
                            }% des accidents totaux.
                        </span>
                    </div>
                </span>
            </div>
            <div id="mainTemporalGraphDiv">
                <span id="topGraphSpan">
                    <div>
                        <Plot
                            data={[
                                {
                                    x: monthList,
                                    y: buildFullTimelineCountData(
                                        monthList,
                                        [selectedYear],
                                    )[1],
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    marker: {
                                        color: theme.plotColors.single_line_color,
                                    },
                                    name: "Accidents par mois",
                                    hovertemplate: `Mois: %{x}<br>`+
                                                   `Nombre: %{y}<br>`+
                                                   `Année: ${selectedYear}`,
                                    //hovertext: monthList,
                                    //text: monthList,
                                }
                            ]}
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
                                title: {
                                    text: `<b>Accidents cycliste sur l'année ${selectedYear}</b>`,
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
                        data={[
                            {
                                x: [... new Set(accidentData.an)].sort(),
                                y: countValues(
                                    accidentData,
                                    // TODO: Replace with component parameter
                                    [... new Set(accidentData.an)].sort(),
                                    'an'
                                ),
                                type: 'scatter',
                                mode: 'lines+markers',
                                //marker: {color: 'red'},
                                name: 'Accident par an',
                                hovertemplate: `Année: %{x}<br>`+
                                               `Nombre: %{y}`,
                            },
                        ]}
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
                                text: '<b>Évolution des accidents cyclistes sur le territoire français</b>',
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
                                    text: 'Année',
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
                <div>
                    <Plot
                        data={[
                            {
                                x: fullTimePlotAllXLabels,
                                y: fullTimePlotAllYData,
                                type: 'scatter',
                                mode: 'lines',
                                name: "Nombre d'accidents",
                                //marker: {color: 'red'},
                                hovertemplate: `Mois-an: %{x}<br>`+
                                               `Nombre: %{y}`,
                            },
                            {
                                x: fullTimePlotAllXLabels,
                                y: fullTimePlotSmoothedData,
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Moyenne sur 12 mois',
                                marker: {color: 'red'},
                                hovertemplate: `Mois-an: %{x}<br>`+
                                               `Nombre: %{y}`,
                            },
                            {
                                x: fullTimePlotAllXLabels,
                                y: fullTimePlotSeasonalData,
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Saisonnalité',
                                marker: {color: 'blue'},
                                hovertemplate: `Mois-an: %{x}<br>`+
                                               `Nombre: %{y}`,
                            },
                            {
                                x: fullTimePlotAllXLabels,
                                y: fullTimePlotResidualData,
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Résidus',
                                marker: {color: 'green'},
                                hovertemplate: `Mois-an: %{x}<br>`+
                                               `Nombre: %{y}`,
                            },
                        ]}
                        layout={ {
                                width: 1400,
                                height: 600,
                                plot_bgcolor: theme.plotColors.plot_bgcolor,
                                paper_bgcolor: theme.plotColors.paper_bgcolor,
                                legend:{
                                    title: {
                                        text: "Légande",
                                    },
                                    font: {
                                        color: theme.plotColors.legend_text_color,
                                    },
                                },
                                margin: {
                                    t: 30,
                                    b: 35,
                                    r: 50,
                                    l: 50,
                                },
                                title: {
                                    text: '<b>Évolution temporelle avec lissage sur 12 mois</b>',
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
                                xaxis: {
                                    color: theme.plotColors.xaxis_color,
                                    linecolor: theme.plotColors.xaxis_line_color,
                                    gridcolor: theme.plotColors.xaxis_grid_color,
                                    title: {
                                        text: 'An - Mois',
                                    },
                                    //rangeselector: {
                                    //    buttons: [
                                    //        {
                                    //            step: 'month',
                                    //            stepmode: 'backward',
                                    //            count: 1,
                                    //            label: '1m'
                                    //        }
                                    //    ]
                                    //},
                                    rangeslider: {}
                                },
                                yaxis: {
                                    color: theme.plotColors.yaxis_color,
                                    gridcolor: theme.plotColors.yaxis_grid_color,
                                    title: {
                                        text: "Nombre d'accidents",
                                    },
                                    fixedrange: true
                                }
                        } }
                    />
                </div>
            </div>
        </div>  
    )
}