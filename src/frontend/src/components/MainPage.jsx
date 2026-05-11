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
                                   themeMode
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
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
                    />
                )
            case "Localisation des accidents":
                return(
                    <MapScatterPage
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
                        //themeMode={themeMode}
                    />
                )
            case "Accidents par région/département":
                return(
                    <MapRegionPage
                        accidentData={accidentData}
                        uniqueYears={uniqueYears}
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