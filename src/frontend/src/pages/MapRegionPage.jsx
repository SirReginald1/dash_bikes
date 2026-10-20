import { useState, useEffect, useRef, useMemo } from 'react'
import { useTheme } from "@mui/material/styles"
import "./MapScatterPage.css"


// TODO: Add ration to population
export default function MapRegionPage({uniqueYears,
                                       accidentData,
                                       variableMetadata,
                                       metadata,
                                       geojsonData,
                                       zoneIndexMap,
                                       zoneComputedData,
                                       idxFilterSet,
                                       idxFilterMap,
                                       unitVarSelected,
                                       regMapSelected,
                                       loadingGeoJsonData,
                                       themeMode}){

    const colorValLabel = new Map([
        ['perAcc', 'Nb acc/10000 hab']
    ]);

    const theme = useTheme();

    const [filterMapChangeFlag, setFilterMapChangeFlag] = useState(0);

    const plotRef = useRef(null);

    const traces = useMemo(() => {
            // Build data arrays
            // Check if metadata for var has keys (is categorical)
            let colVals = []
            let lebelVals = []
            let geojsonKeys = []
            // Find the value that the least keys to use as iterator in case of mismatch between
            // data and geojson
            let zoneIterator
            //console.log(`selected zone: ${selectedZones}`)
            //console.log(`selected zone dict size: ${zoneIndexMap.get(selectedZones).size}`)
            if (zoneIndexMap.get(regMapSelected).size < zoneComputedData.get(regMapSelected)){
                zoneIterator = zoneIndexMap.get(regMapSelected).keys()
            }
            else{
                zoneIterator = zoneComputedData.get(regMapSelected).keys()
            }
            for(let zone of zoneIterator){
                // Only add data if pressent in both datasets
                let zoneFromBaseData = zoneIndexMap.get(regMapSelected).get(zone)
                let zoneFromGeojson = zoneComputedData.get(regMapSelected).get(zone)
                //console.log(`zoneFromBaseData: ${zoneFromBaseData}`)
                //console.log(`zoneFromGeojson: ${zoneFromGeojson}`)
                // Only if zone exists in both datasets
                if(zoneFromBaseData !== undefined && zoneFromGeojson !== undefined){
                    // Add computed values to map arrays
                    let computedVal
                    let filteredIndexes
                    if(idxFilterMap.size === 0 & idxFilterSet.size === 0)
                        filteredIndexes = new Set(zoneFromBaseData)
                    else if(idxFilterMap.size > 0 & idxFilterSet.size === 0)
                        filteredIndexes = idxFilterSet
                    else
                        filteredIndexes = new Set(zoneFromBaseData).intersection(idxFilterSet)
                    //let filteredIndexes = new Set(zoneFromBaseData).intersection(idxFilterSet)
                    //console.log(`mixedFilterSet: ${mixedFilterSet.size}`)
                    if(unitVarSelected === 'perAcc'){
                        console.log(`divider: ${(zoneFromGeojson.get("pop") / 10000)}`)
                        computedVal = (filteredIndexes.size / 
                            (zoneFromGeojson.get("pop") / 10000))
                        lebelVals.push(computedVal.toFixed(3))
                    }
                    else{
                        computedVal = filteredIndexes.size
                        lebelVals.push(computedVal)
                    }
                    geojsonKeys.push(zone)
                    colVals.push(Math.log(computedVal))
                }
            }
            // Build hover message
            let hoverMessage
            let unitLabel
            let specialUnitLabel = colorValLabel.get(unitVarSelected)
            if(specialUnitLabel === undefined){
                unitLabel = "Nb accidents"
            }
            else{
                unitLabel = specialUnitLabel
            }
            // Select color variable
            if(unitVarSelected === 'perAcc'){
                hoverMessage = "<b>%{properties.nom}</b><br>" +
                               "Population: %{properties.pop}<br>" +
                               `${unitLabel}: %{customdata}<extra></extra>`
            }
            console.log(`colVals: ${colVals}`)
            console.log(`geojsonKeys: ${geojsonKeys}`)
            //console.log(`colVals len: ${colVals.length}`)
            return(
                [{
                    type: "choroplethmap",
                    geojson: geojsonData.get(regMapSelected),
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
        [filterMapChangeFlag, unitVarSelected, regMapSelected, idxFilterSet]
    );

    const layout = useMemo(() => {
        return({
            map: {
                style: theme.palette.mode === 'light' ? 'open-street-map' : 'dark',
                center: {lon: 2.5, lat: 46.5},
                zoom: 5.5
            },
            //width: 600,
            //height: 400,
            margin: {t: 0, b: 0, r:0, l:0}
        })
    }, [theme])


   // Initial render
    useEffect(() => {
        //console.log(`geo region: ${testGeo}`)
        //console.log(`geo test: ${Object.keys(geoData.test)}`)
        Plotly.newPlot(
            plotRef.current,
            traces,
            //data,
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
    }, [])

    // Update traces when filters change
    useEffect(() => {
        //console.log(`traces len: ${traces.length}`)
        //console.log(`layout len: ${layout.length}`)
        Plotly.react(
            plotRef.current,
            traces,
            layout
        )
    }, [traces, theme/*, colorVarSelected*/])
    
    return(
        <div id='rootDiv'>   
            <div id='mapDiv'>
                <div ref={plotRef} id='map'/>
            </div>
        </div>
    )
}
