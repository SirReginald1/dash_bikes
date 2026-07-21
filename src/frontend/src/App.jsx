import { useState, useEffect, useMemo, useRef } from 'react'
import { ThemeProvider,
         CssBaseline,
         GlobalStyles } from '@mui/material';
import { lightTheme, darkTheme } from './themes.jsx'
import { getIndexes,
         concatIdxMap,
         depToRegCodeMap,
         depsInRegCodeMap,
         getIndexContinuBracketSet,
         getIndexesSet,
         filterByValuesSet,
         extractIdxFromFilterMap } from './utils.js'
import Navbar from './components/NavigationBar.jsx'
import Sidebar from './components/SideBarMenu.jsx'
import MainPage from './components/MainPage.jsx';
import './App.css'
//import MenuIcon from '@mui/icons-material/Menu';

function App() {
  //const [currentPageContent, setCurrentPage] = useState("aligner")
  const [themeMode, setTheme] = useState(
    sessionStorage.getItem("themeMode") ?? "dark"
  );

  const [accidentData, setAccidentData] = useState();

  const [metadata, setMetadata] = useState();

  const [regMapGeojson, setRegMapGeojson] = useState();

  const [depMapGeojson, setDepMapGeojson] = useState();

  const [geojsonData, setGeojsonData] = useState(new Map());

  const [loadingAccidentData, setLoadingAccidentData] = useState(true);

  const [loadingGeojsonData, setLoadingGeojsonData] = useState(true);

  useEffect(() => {
    sessionStorage.setItem("themeMode", themeMode)
  }, [themeMode])

  const theme = themeMode === "light" ? lightTheme : darkTheme;

  const initialNavDropSelectedVals = [["Nationale",
                                       "Régional",
                                       "Département"],
                                      ["D2L1",
                                       "D2L2"]];
       
  /**
   * The array of the same length as the 
   */
  const [navDropSelectedVals, setNavDropSelectedVals] = useState(
    initialNavDropSelectedVals.map(menu => menu[0])
  );

  const [sideBarOpen, setSideBarOpen] = useState(false);

  const [mainPage, setMainPage] = useState("Evolution temporelle");

  /* The title for each menu section in the side bar */
  const sidebarMenuSectionTitles = ["Visualisation", "Cartes interactives"];

  /* The labels for each of the menu items in the side bar menu */
  const sidebarMenuSectionItems = [["Evolution temporelle",
                                    "Caratéristiques des accidents"],
                                   ["Localisation des accidents",
                                    "Accidents par région/département"]]
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  const [filterMap, setFilterMap] = useState(new Map());

  //const filterMap = useRef(new Map());

  //const [filterMapChangeFlag, setFilterMapChangeFlag] = useState(false);

  const [filterBarIsOpen, setFilterBarIsOpen] = useState(0);

  // TODO: Find more efficient way to plug filter map into graphs
  const idxFilterMap = useMemo(() => {
    return(extractIdxFromFilterMap(accidentData, filterMap/*.current*/))
  }, [filterMap]);

  const idxFilterSet = useMemo(() => {
    return(concatIdxMap(idxFilterMap))
  }, [idxFilterMap])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [uniqueYears, setUniqueYears] = useState([]);

  const [dataZoneIndexes, setDataZoneIndexes] = useState(new Map([
    ["reg", new Map()],
    ["dep", new Map()]
  ]));

  const [zoneComputedData, setZoneComputedData] = useState(new Map([
    ["reg", new Map()],
    ["dep", new Map()]
  ]))

  //const [depPopDataMap, setDepPopDataMap] = useState(new Map());

  //const [regPopDataMap, setRegPopDataMap] = useState(new Map());
                                
  useEffect(() => {
    console.log(`Main page value changed to: ${mainPage}`)
  }, [mainPage]);

  // Initial data fetching
  useEffect(() => {
    //fetch("/dash_bikes/data").then(res => res.json()).then(setAppData)
    //fetch("/dash_bikes/metadata").then(res => res.json()).then(setMetadata)
    //fetch("/dash_bikes/reg_map").then(res => res.json()).then(setRegMapGeojson)
    //fetch("/dash_bikes/dep_map").then(res => res.json()).then(setDepMapGeojson)
    Promise.all([
      fetch("http://localhost:8000/dash_bikes/data").then(res => res.json()),//.then(setAccidentData)
      fetch("http://localhost:8000/dash_bikes/metadata").then(res => res.json())

    ])
    .then(([accidentData, metadata]) => {
      setAccidentData(accidentData)
      setMetadata(metadata)
      setUniqueYears([... new Set(accidentData.an)].sort())
      // Compute department indexes
      for(let dep of depToRegCodeMap.keys()){
        // If there are no occurrences of zone in the data do not include it
        let indexes = getIndexes(accidentData['dep'], dep)
        //console.log(`dep: ${dep}, len: ${indexes.length}`)
        if(indexes.length !== 0){
          dataZoneIndexes.get("dep").set(dep, indexes)
        }
      }
      // Compute region indexes
      for(let reg of depsInRegCodeMap.keys()){
        let regIndexes = []
        // Concat dep indexes for each region
        for(let dep of depsInRegCodeMap.get(reg)){
          regIndexes = regIndexes.concat(dataZoneIndexes.get("dep").get(dep))
        }
        dataZoneIndexes.get("reg").set(reg, regIndexes)
      }
      //setDataDepIndexMap(out)
    })
    .catch(err => {
      console.log('Error while loading application data and metadata.')
      console.error(err)
      return(
        <h1>Error fetching data. Try reloading the page.</h1>
      )
    })
    .finally(() => {
      setLoadingAccidentData(false)
      // DEBUG
      //console.log(`dep index map: ${[...dataDepIndexMap.keys()]}`)
    })

    Promise.all([
      fetch("http://localhost:8000/dash_bikes/reg_map").then(res => res.json()),
      fetch("http://localhost:8000/dash_bikes/dep_map").then(res => res.json())
    ])
    .then((geojsonFetches
      //[regMap, depMap]
    ) => {
      // TODO: Move this into map that links it to url splat out urls into fetches
      const zoneKeys = ["reg", "dep"]
      for(let i=0;i<geojsonFetches.length;i++){
        //console.log(`i: ${i}, data: ${geojsonFetches[i]['features']}`)
        geojsonData.set(zoneKeys[i], geojsonFetches[i])
        for(let zone of geojsonFetches[i]['features']){
          //regPopDataMap.set(reg['properties']['code'], Number(reg['properties']['pop']))
          zoneComputedData.get(zoneKeys[i]).set(zone['properties']['code'], new Map())
          zoneComputedData.get(zoneKeys[i]).get(zone['properties']['code']).set("pop", Number(zone['properties']['pop']))
        }
      }
      //setRegMapGeojson(regMap)
      //setDepMapGeojson(depMap)
      // Get population data from geojson
      //for(let reg of regMap['features']){
      //  //regPopDataMap.set(reg['properties']['code'], Number(reg['properties']['pop']))
      //  zoneComputedData.get("reg").set(reg['properties']['code'], new Map())
      //  zoneComputedData.get("reg").get(reg['properties']['code']).set("pop", Number(reg['properties']['pop']))
      //}
      //for(let dep of depMap['features']){
      //  //depPopDataMap.set(dep['properties']['code'], Number(dep['properties']['pop']))
      //  zoneComputedData.get("dep").set(dep['properties']['code'], new Map())
      //  zoneComputedData.get("dep").get(dep['properties']['code']).set("pop", Number(dep['properties']['pop']))
      //}
    })
    .catch(err => {
      console.log('Error while loading geojson data.')
      console.log(err)
    })
    .finally(() => {
      setLoadingGeojsonData(false)
    })
    // Dev server address
    //fetch("http://localhost:8000/dash_bikes/reg_map").then(res => res.json()).then(setRegMapGeojson)
    //fetch("http://localhost:8000/dash_bikes/metadata").then(res => res.json()).then(setMetadata)
    //fetch("http://localhost:8000/dash_bikes/dep_map").then(res => res.json()).then(setDepMapGeojson)
    //console.log(accidentData.toString())
  }, [])

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Map only updates when using continuous variables !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // TODO: Find a way to not copy map at each update (make useRef work again)
    /**
     * Function that is passed to each selector element to set that map
     * of selected indexes.
     * @param {String} variable The variable label as it appears in the data
     *  object.
     * @param {Array[String | Number]} values Array containing all the selected
     *  values.
     * @param {Number} includeValues A value to include in every selection.
     *  Used to include "null" values. Default is undefined.
     */
    function setFilterMapWrapper(variable, values, includeValues = undefined){
        // Var is categorical
        console.log("Map set!")
        if(Object.hasOwn(metadata['accidentVelo'][variable], 'keys')){
            let valueSet = new Set()
            for(const paire of values){
                // Try to clean up this logic
                if(values instanceof Array){
                    // Allow this to work for strings
                    if(Number.isNaN(Number(paire[0]))){
                        valueSet.add(paire[0])    
                    }
                    else{
                        valueSet.add(Number(paire[0]))
                    }
                }
                else{
                    valueSet.add(paire)
                }
            }
            if(valueSet.size > 0){
              /*
                filterMap.current.set(
                    variable,
                    getIndexesSet(accidentData[variable], valueSet)
                )
              */

             filterMap.set(
               variable,
               getIndexesSet(accidentData[variable], valueSet)
              )
              //console.log(`keys: ${[...filterMap.keys()]}`)
              //console.log(`keys: ${[...filterMap.keys()]}`)
              setFilterMap(new Map(filterMap));
            }
            else{ // If none or all are selected
                //filterMap.current.delete(variable)
                filterMap.delete(variable)
                setFilterMap(new Map(filterMap));
            }
        }
        else{
            // If variable set to all
            if(values === 'all'){
                /*filterMap.current.delete(variable)*/
                filterMap.delete(variable)
                setFilterMap(new Map(filterMap));
            }
            else{
                /*
                filterMap.current.set(
                    variable,
                    getIndexContinuBracketSet(
                        accidentData[variable],
                        values,
                        includeValues
                        //variableKeyMap[variable]["null_replace_val"]
                    )
                )
                */
               filterMap.set(
                    variable,
                    getIndexContinuBracketSet(
                        accidentData[variable],
                        values,
                        includeValues
                        //variableKeyMap[variable]["null_replace_val"]
                    )
                )
              console.log(`keys: ${[...filterMap.keys()]}`)
              setFilterMap(new Map(filterMap));
            }
        }
        //setFilterMapFunction(filterMap)
        //console.log(`map size: ${filterMap/*.current*/.size}`)
        //console.log(`map set to: ${[...filterMap/*.current*/.entries()]}`)
        //for(const [k, v] of filterMap.current.entries()){
        //    console.log(`key: ${k}`)
        //    console.log(`set: ${[...v]}`)
        //}
        //let flag = filterMapChangeFlag === false ? true : false
        //setFilterMapChangeFlag(true)
        //console.log(`Flag change initial. val: ${filterMapChangeFlag}`)
        //console.log(`bool val: ${flag === false}, result: ${flag === false ? true : false}`)
        //setFilterMapChangeFlag(filterMapChangeFlag === 0 ? 1 : 0)
        //setFilterMapChangeFlag(f => f + 1);
        //console.log(`flag: ${filterMapChangeFlag}`)
        //setFilterMapChangeFlag(false)
        //console.log(`Flag change after switch. val: ${filterMapChangeFlag}`)
    }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////


  //useEffect(() => {
  //  setUniqueYears([... new Set(accidentData.an)].sort())
  //}, [accidentData])

  if(loadingAccidentData){
    return(
      <p>Loading...</p>
    )
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <GlobalStyles 
            styles={(theme) => ({
              ':root': theme.customThemes
            })}
          />
          <div className='mainNavBarDiv'>
            <Navbar
              sideBarButtonAction={setSideBarOpen}
              sideBarOpenVar={sideBarOpen}
              filterBarButtonAction={setFilterBarIsOpen}
              filterOpenVar={filterBarIsOpen}
              dropdownLabels={initialNavDropSelectedVals}
              dropdownValues={navDropSelectedVals}
              setDropdownVals={setNavDropSelectedVals}
              themeSwitchVal={themeMode}
              setTheme={() => setTheme(prev => 
                (prev === "light" ? "dark" : "light")
              )}
            />
          </div>
          <div id='sideBarParentDiv'>
            <Sidebar
              isOpen={sideBarOpen}
              menuSectionTitles={sidebarMenuSectionTitles}
              menuSectionItems={sidebarMenuSectionItems}
              switchPageFunction={setMainPage}
            />
          </div>
            <MainPage
              filterBarIsOpen={filterBarIsOpen}
              selectedPage={mainPage}
              uniqueYears={uniqueYears}
              accidentData={accidentData}
              metadata={metadata['accidentVelo']}
              filterMap={filterMap}
              idxFilterMap={idxFilterMap}
              idxFilterSet={idxFilterSet}
              //filterMapChangeFlag={filterMapChangeFlag}
              //setFilterMapChangeFlag={setFilterMapChangeFlag}
              setFilterMap={setFilterMapWrapper}
              geojsonData={geojsonData}
              zoneIndexMap={dataZoneIndexes}
              zoneComputedData={zoneComputedData}
              loadingGeoJsonData={loadingGeojsonData}
              //themeMode={themeMode}
            />
        </CssBaseline>
      </ThemeProvider>
    </>
  )
}

export default App
