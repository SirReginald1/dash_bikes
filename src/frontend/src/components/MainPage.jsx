import TemporalPage from "../pages/TemporalPage.jsx"
import CharacteristicsPage from "../pages/CharacteristicsPage.jsx"
import "./MainPage.css"


/**
 * 
 * @param {String} selectedPage 
 * @returns 
 */
export default function MainPage({ selectedPage,
                                   accidentData,
                                   uniqueYears,
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
                    <span>
                        Localisation des accidents
                    </span>
                )
            case "Accidents par région/département":
                return(
                    <span>
                        Accidents par région/département
                    </span>
                )
        }
    }

    return(
        <div className="mainPageRootDiv">
            {selectPage(selectedPage)}
        </div>
    )

}