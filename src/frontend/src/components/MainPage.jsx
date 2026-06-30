import TemporalPage from "../pages/TemporalPage.jsx"
import CharacteristicsPage from "../pages/CharacteristicsPage.jsx"
import MapScatterPage from "../pages/MapScatterPage.jsx"
import MapRegionPage from "../pages/MapRegionPage.jsx"
import "./MainPage.css"


/**
 * 
 * @param {String} selectedPage 
 * @returns 
 */
export default function MainPage({ selectedPage,
                                   accidentData,
                                   uniqueYears,
                                   themeMode,
                                   metadata,
                                   geojsonData,
                                   zoneIndexMap,
                                   zoneComputedData,
                                   loadingGeoJsonData,
                                 }) {

    /**
     * 
     * @param {String} pageLabel The label
     * @returns 
     */
    function selectPage(pageLabel) {
        switch(pageLabel){
            case "Evolution temporelle":
                return(
                    <TemporalPage 
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
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
    }

    return(
        <div className="mainPageRootDiv">
            {selectPage(selectedPage)}
        </div>
    )

}