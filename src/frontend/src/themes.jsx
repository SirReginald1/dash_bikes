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
      plotColors: {
        single_line_color: "steelblue",
        multi_line_color: ["red", "green", "blue", "steelblue"],
        plot_bgcolor: "#e0e9f4",
        paper_bgcolor: "white",
        xaxis_color: "none",
        xaxis_line_color: "none",
        xaxis_grid_color: "white",
        yaxis_grid_color: "white",
        legend_text_color: "black",
        title_color: "rgb(68, 68, 68);",
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
      },
      plotColors: {
        single_line_color: "steelblue",
        multi_line_color: ["red", "green", "blue", "steelblue"],
        plot_bgcolor: "white",
        paper_bgcolor: "#121212",
        xaxis_color: "white",
        yaxis_color: "white",
        //xaxis_line_color: "none",
        xaxis_grid_color: "#e2dcdc",
        yaxis_grid_color: "#e2dcdc",
        legend_text_color: "white",
        title_color: "white",
      },
    });