import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
      palette: {
        mode: "light",
      },
      customThemes: {
        '--navbarElementColor': '#000000',
        '--navbarBackground': 'red',
        '--navbarDropdownSelectionItems': 'rgba(255, 255, 0, 0.81)',
        '--navbarSelectedDropdownItem': 'rgba(255, 255, 0, 0.81)',
        '--navbarDropdownArrow': 'rgba(255, 255, 0, 0.81)',
        '--sidebarColor': '#222',
        '--sidebarButtonColor': 'white',
        '--sidebarTitleColor': 'red',
      },
    });

export const darkTheme = createTheme({
      palette: {
        mode: "dark",
      },
      customThemes: {
        '--navbarElementColor': '#000000',
        '--navbarBackground': 'red',
        '--navbarDropdownSelectionItems': 'rgba(255, 255, 0, 0.81)',
        '--navbarSelectedDropdownItem': 'rgba(255, 255, 0, 0.81)',
        '--navbarDropdownArrow': 'rgba(255, 255, 0, 0.81)',
        '--sidebarColor': '#222',
        '--sidebarButtonColor': 'white',
        '--sidebarTitleColor': 'red',
      }
    });