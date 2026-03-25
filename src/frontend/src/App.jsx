import { useState, useEffect } from 'react'
import { ThemeProvider,
         CssBaseline,
         GlobalStyles } from '@mui/material';
import { lightTheme, darkTheme } from './themes.jsx'
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

  const [appData, setAppData] = useState(
    {}
  );

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

  const [mainPage, setMainPage] = useState("First page");

  /* The title for each menu section in the side bar */
  const sidebarMenuSectionTitles = ["Visualisation", "Cartes interactives"];

  /* The labels for each of the menu items in the side bar menu */
  const sidebarMenuSectionItems = [["Evolution temporelle",
                                    "Caratéristiques des accidents"],
                                   ["Localisation des accidents",
                                    "Accidents par région/département"]
                                  ]

  useEffect(() => {
    console.log(`Main page value changed to: ${mainPage}`)
  }, [mainPage]);


  useEffect(() => {
    fetch("/dash_bikes/data").then(res => res.json()).then(setAppData)
    console.log(appData)
  }, [])

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
              dropdownLabels={initialNavDropSelectedVals}
              dropdownValues={navDropSelectedVals}
              setDropdownVals={setNavDropSelectedVals}
              themeSwitchVal={themeMode}
              setTheme={() => setTheme(prev => 
                (prev === "light" ? "dark" : "light")
              )}
            />
          </div>
          <div className='sideBarParentDiv'>
            <Sidebar
              isOpen={sideBarOpen}
              menuSectionTitles={sidebarMenuSectionTitles}
              menuSectionItems={sidebarMenuSectionItems}
              switchPageFunction={setMainPage}
            />
          </div>
          <MainPage
            selectedPage={mainPage}
          />
        </CssBaseline>
      </ThemeProvider>
    </>
  )
}

export default App
