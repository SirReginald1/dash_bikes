import { useTheme, styled } from "@mui/material/styles"
import { Switch, IconButton, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import "./NavigationBar.css"
import bike_accident_img from "../assets/accident_bike.png"


/**
 * Navigation bar component
 * 
 * Renders a navigation bar containing a button for each provided item.
 * 
 * @param {string[]} props.items - List of labels used to generate navigation buttons
 * @param {(item: string) => void} [props.onItemClick] - Optional callback fired when a button is clicked
 *
 * @example
 * <NavBar
 *   items={["Home", "About", "Contact"]}
 *   onItemClick={(item) => console.log(item)}
 * />
 */
export default function Navbar({sideBarButtonAction,
                                sideBarOpenVar,
                                filterBarButtonAction,
                                filterOpenVar,
                                dropdownValues,
                                dropdownLabels,
                                setDropdownVals,
                                themeSwitchVal,
                                setTheme}) {

  const theme = useTheme();

  function toggleSideBarOpen() {
    sideBarButtonAction(!sideBarOpenVar)
  }

  //const [testBool, setTestBool] = useState(false);
  
  const FilterButton = styled(Button)(({ /*theme*/ }) => ({
    //color: theme.palette.getContrastText(filterOpenVar ? '/*purple[500]*/),
    backgroundColor: filterOpenVar ? theme.customThemes.navbarFilterBtnColor/*'lightblue'*/ : 'none'/*purple[500]*/,
    '&:hover': {
      backgroundColor: filterOpenVar ? theme.customThemes.navbarFilterBtnColor/*'lightblue'*/ : 'none'/*purple[700]*/,
    },
    borderColor: theme.customThemes.navbarFilterBtnColor,
    color: filterOpenVar ? theme.customThemes.navbarFilterFilledBtnTextColor : theme.customThemes.navbarFilterBtnColor,
  }));

  function toggleFilterOpen() {
    filterBarButtonAction(!filterOpenVar)
  }

  return(
    <nav className="mainNavBar">
      <span className="mainNavBarSpanLeft">
        <img 
          id="navBarLogo"
          src={bike_accident_img}
        />
        <IconButton 
          onClick={toggleSideBarOpen}
          className="navbarMenuBtn"
          aria-label="delete"
          size="large"
        >
          <MenuIcon fontSize="inherit"/>
        </IconButton>
        <FilterButton
          id="navbarFilterButton"
          onClick={toggleFilterOpen}
          variant={filterOpenVar ? "contained" : "outlined"}
        >
          Filter
        </FilterButton>
        {
        //<NavbarDropdownSpan
        //  dropdownItemLabels={dropdownLabels}
        //  dropdownSelectedVals={dropdownValues}
        //  setSelectedVals={setDropdownVals}
        ///>
        }
      </span >
      <span className="mainNavBarSpanRight">
        <Switch
          className="themeSwitch"
          checked={themeSwitchVal === "dark"}
          onChange={setTheme}
        />
      </span>
    </nav>
  )
}