import { useMemo } from "react"
import TemporalPage from "../pages/TemporalPage.jsx"
import CharacteristicsPage from "../pages/CharacteristicsPage.jsx"
import MapScatterPage from "../pages/MapScatterPage.jsx"
import MapRegionPage from "../pages/MapRegionPage.jsx"
import FilterSidebar from "./FilterSideBar.jsx"
import {
    getIndexContinuBracketSet,
    getIndexesSet,
    concatIdxMap,
    extractValues,
    getIndexes
} from '../utils.js'
import "./MainPage.css"
import { Slider } from "@mui/material"


/**
 * 
 * @param {String} selectedPage 
 * @returns 
 */
export default function MainPage({ filterBarIsOpen,
                                   selectedPage,
                                   accidentData,
                                   uniqueYears,
                                   themeMode,
                                   metadata,
                                   filterMap,
                                   idxFilterMap,
                                   setFilterMap,
                                   idxFilterSet,
                                   //filterMapChangeFlag,
                                   //setFilterMapChangeFlag,
                                   geojsonData,
                                   zoneIndexMap,
                                   zoneComputedData,
                                   loadingGeoJsonData,
                                 }) {
    
    const mainPageContent = useMemo(() => {
        switch(selectedPage){
            case "Evolution temporelle":
                return(
                    <TemporalPage 
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
                        //filterMapChangeFlag={filterMapChangeFlag}
                        filterMap={filterMap}
                        idxFilterMap={idxFilterMap}
                        idxFilterSet={idxFilterSet}
                    />
                )
            case "Caratéristiques des accidents":
                return(
                    <CharacteristicsPage
                        uniqueYears={uniqueYears}
                        accidentData={accidentData}
                        variableKeyMap={metadata}
                    />
                )
            case "Localisation des accidents":
                return(
                    <MapScatterPage
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
                        variableKeyMap={metadata}
                        //themeMode={themeMode}
                    />
                )
            case "Accidents par région/département":
                return(
                    <MapRegionPage
                        filterBarIsOpen={filterBarIsOpen}
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
                        geojsonData={geojsonData}
                        zoneIndexMap={zoneIndexMap}
                        zoneComputedData={zoneComputedData}
                        variableMetadata={metadata}
                        loadingGeoJsonData={loadingGeoJsonData}
                    />
                )
        }
    }, [selectedPage, filterMap]);

    const filterBar = useMemo(() => {
        let excludedVars
        let headerComponent = undefined
        switch(selectedPage){
            case "Evolution temporelle":
                excludedVars = [/*'an', */'date', 'hrmn', 'dep', 'lat', 'lon']
                /*headerComponent = <div>
                    <h5>Année</h5>
                    <Slider
                    
                    />

                    
                </div>*/
                break
            case "Caratéristiques des accidents":
                excludedVars = ['date', 'hrmn', 'dep', 'lat', 'lon']
                break
            case "Localisation des accidents":
                excludedVars = ['date', 'hrmn', 'dep', 'lat', 'lon']
                break
            case "Accidents par région/département":
                excludedVars = ['date', 'hrmn', 'dep', 'lat', 'lon']
                break
        }
        return(
            <FilterSidebar
                id="rootSideBar"
                className={filterBarIsOpen ? 'open' : 'closed'}
                accidentData={accidentData}
                variableKeyMap={metadata}
                setFilterMapFunction={setFilterMap}
                excludedVars={excludedVars}
                //headerComponent={headerComponent}
            />
        )
    }, [filterBarIsOpen, selectedPage]);

    return(
        <div className="mainPageRootDiv">
            <span id="mainSpan">
                {filterBar}
                <div
                    id="mainContentRoot"
                    className={filterBarIsOpen ? "openMain" : "closeMain"}
                >
                    {mainPageContent}
                </div>
            </span>
        </div>
    )

}