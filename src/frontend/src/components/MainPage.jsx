import TemporalPage from "../pages/TemporalPage.jsx"


/**
 * 
 * @param {String} selectedPage 
 * @returns 
 */
export default function MainPage({selectedPage}) {

    /**
     * 
     * @param {String} pageLabel The label
     * @returns 
     */
    function selectPage(pageLabel) {
        switch(pageLabel){
            case "Evolution temporelle":
                return(
                    <TemporalPage/>
                )
            case "Caratéristiques des accidents":
                return(
                    <span>
                        Caratéristiques des accidents
                    </span>
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