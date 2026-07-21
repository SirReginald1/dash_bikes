import { useMemo, useState } from "react"
import { FormControl, Select, MenuItem } from "@mui/material"
import FilterSidebar from "./FilterSideBar.jsx"
import TemporalPage from "../pages/TemporalPage.jsx"
import CharacteristicsPage from "../pages/CharacteristicsPage.jsx"
import MapScatterPage from "../pages/MapScatterPage.jsx"
import MapRegionPage from "../pages/MapRegionPage.jsx"
import InfoPage from "../pages/InfoPage.jsx"
import "./MainPage.css"


/**
 * 
 * @param {String} selectedPage 
 * @returns 
 */
export default function MainPage({ filterBarIsOpen,
                                   selectedPage,
                                   accidentData,
                                   uniqueYears,
                                   metadata,
                                   filterMap,
                                   idxFilterMap,
                                   setFilterMap,
                                   idxFilterSet,
                                   geojsonData,
                                   zoneIndexMap,
                                   zoneComputedData,
                                   loadingGeoJsonData,
                                 }) {

    const [colorVarSelected, setColorVarSelected] = useState('None');

    const [unitVarSelected, setUnitVarSelected] = useState('perAcc');

    const [regMapSelected, setRegMapSelected] = useState('reg');

    const [selectedYears, setSelectedYears] = useState(
        [uniqueYears[0], uniqueYears[uniqueYears.length-1]]
    )
    
    // Callback map specifies the variable for which each callback function
    // will be called.
    // Each callback function takes the string referencing the variable as
    // first argument and the value as returned by the selector element as
    // second argument.
    const callbackFunctionMap = new Map([
        ['an', (variable, value) => {
            setSelectedYears(value)
        }],
        /*['dep', (variable, value) => {
            console.log(`variable: ${variable}`)
            console.log(`dep val: ${value}`)
            console.log(`dep val dep val[0][0]: ${value[0][0]}`)
            console.log(`dep val dep val type: ${value[0][0].constructor.name}`)
            console.log(`accident dep val: ${accidentData['dep'][0]}`)
            console.log(`accident dep type: ${accidentData['dep'][0].constructor.name}`)
        }],
        ['lum', (variable, value) => {
            console.log(`lum val: ${value}`)
            console.log(`lum val constructor name: ${value.constructor.name}`)
            console.log(`lum val: ${value[0].constructor.name}`)
            console.log(`lum val len: ${value[0].length}`)
            console.log(`lum val deep: ${value[0][0].constructor.name}`)
            console.log(`lum val is nb: ${value[0] instanceof Number}`)
            console.log(`lum val is str: ${value[0] instanceof String}`)
            console.log(`lum val is array: ${value[0] instanceof Array}`)
        }]*/
    ])

    const mainPageContent = useMemo(() => {
        switch(selectedPage){
            case "Evolution temporelle":
                return(
                    <TemporalPage 
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
                        selectedYears={selectedYears}
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
                        filterMap={filterMap}
                        idxFilterSet={idxFilterSet}
                    />
                )
            case "Localisation des accidents":
                return(
                    <MapScatterPage
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
                        variableKeyMap={metadata}
                        //themeMode={themeMode}
                        colorVarSelected={colorVarSelected}
                        idxFilterMap={idxFilterMap}
                        idxFilterSet={idxFilterSet}
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
                        idxFilterSet={idxFilterSet}
                        idxFilterMap={idxFilterMap}
                        unitVarSelected={unitVarSelected}
                        regMapSelected={regMapSelected}
                    />
                )
            case "Info":
                return(
                    <InfoPage/>
                )
        }
    }, [selectedPage, filterMap, colorVarSelected, unitVarSelected, regMapSelected]);

    const filterBar = useMemo(() => {
        let excludedVars
        let headerComponent = undefined
        switch(selectedPage){
            case "Evolution temporelle":
                excludedVars = ['date', 'hrmn', 'lat', 'lon']
                break
            case "Caratéristiques des accidents":
                excludedVars = ['an', 'date', 'hrmn', 'dep', 'lat', 'lon']
                break
            case "Localisation des accidents":
                excludedVars = ['date', 'hrmn', 'dep', 'lat', 'lon']
                headerComponent = <div id='rootHeaderDiv'>
                                    <h4 id='headerTitle'>
                                        Variable color selection
                                    </h4>
                                    <FormControl id='headerVarSelectFormControl'>
                                        <Select
                                            id='headerVarSelect'
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
                                            ].concat(Object.keys(metadata).map((key, idx) => {
                                                if(!['date', 'hrmn', 'dep', 'lat', 'lon'].includes(key)){
                                                    return(
                                                        <MenuItem
                                                            className="navbarMenuItem"
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {metadata[key]['full_label']}
                                                        </MenuItem>
                                                    )
                                                }
                                            }))}
                                        </Select>
                                    </FormControl>
                                </div>
                break
            case "Accidents par région/département":
                excludedVars = ['date', 'hrmn', 'dep', 'lat', 'lon']
                headerComponent = <div id='rootHeaderDiv'>
                    <h4 className='headerTitle'>
                        Unite selection
                    </h4>
                    <FormControl id='headerVarSelectFormControl'>
                        <Select
                            id='headerVarSelect1'
                            value={unitVarSelected}
                            onChange={(event) => setUnitVarSelected(event.target.value)}
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
                                key="perAcc/Hab"
                                value="perAcc/Hab"
                            >
                                Nombre accident / habitent
                            </MenuItem>
                        </Select>
                        <h4 className='headerTitle'>
                            Zone selection
                        </h4>
                        <Select
                            id='headerVarSelect2'
                            value={regMapSelected}
                            onChange={(event) => setRegMapSelected(event.target.value)}
                        >
                            <MenuItem
                                className="navbarMenuItem"
                                key='reg'
                                value='reg'
                            >
                                Régions
                            </MenuItem>
                            <MenuItem
                                className="navbarMenuItem"
                                key="dep"
                                value="dep"
                            >
                                Départements
                            </MenuItem>
                        </Select>
                    </FormControl>
                </div>
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
                headerComponent={headerComponent}
                callbackFunctionMap={callbackFunctionMap}
            />
        )
    }, [filterBarIsOpen, selectedPage, colorVarSelected, unitVarSelected, regMapSelected]);

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