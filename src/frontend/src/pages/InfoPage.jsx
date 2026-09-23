import "./InfoPage.css"

export default function InfoPage(){
    return(
        <div id="infoPageRootDiv">
            <h1>Info page</h1>
            <div id="mainContent">
                <h2>Provenance des données</h2>
                <lu id="dataRefList">
                    <li>
                        <b>Données accident de vélo: </b> 
                        <a 
                            href="https://www.data.gouv.fr/datasets/accidents-de-velo"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://www.data.gouv.fr/datasets/accidents-de-velo
                        </a>
                    </li>
                    <li>
                        <b>Données population: </b>
                        <a 
                            href="https://www.insee.fr/fr/statistiques/8680726?sommaire=8681011"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://www.insee.fr/fr/statistiques/8680726?sommaire=8681011
                        </a>
                    </li>
                </lu>
                <h2>Contact developer</h2>
                <lu id="devContactList">
                    <li><b>Email:</b> ...</li>
                    <li><b>Site web:</b> ...</li>
                    <li><b>Github:</b> Comming soon</li>
                </lu>
            </div>
        </div>
    )
}