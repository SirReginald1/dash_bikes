import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
      palette: {
        mode: "light",
      },
      customThemes: {
        '--mainContentBackground': 'linear-gradient(' +
          '337deg,' +
          'rgba(255, 255, 255, 0.7) 0%,' +
          'rgba(251, 255, 0, 0.7) 35%,' +
          'rgba(255, 166, 50, 0.8) 70%,' +
          'rgba(255, 0, 0, 0.6) 100%' +
        ')',
        '--widgetColor': 'rgb(61, 249, 255)',
        widgetColor: 'rgb(61, 168, 255)',
        '--navbarElementColor': '#000000',
        '--navbarBackground': 'rgb(73, 159, 235)',
        '--navbarDropdownSelectionItems': 'rgba(255, 255, 0, 0.81)',
        '--navbarSelectedDropdownItem': 'rgba(255, 255, 0, 0.81)',
        '--navbarDropdownArrow': 'rgba(255, 255, 0, 0.81)',
        '--sidebarColor': '#ffffff',
        '--sidebarButtonColor': 'black',
        '--sidebarTitleColor': 'rgba(255, 0, 0, 0.6)',
        '--sidebarBorder': '1px solid rgba(0,0,0,0.5)',
        '--logoHueOffset': '195deg',
        '--logoSaturationOffset': '4',
        '--navbarBtnTextColor': 'black',
        '--navbarBtnBoarderColor': 'black',
        '--navbarBtnFillColor': 'none',
        '--sidebarFilterBackground': 'rgba(255,255,255,0)',
        navbarFilterBtnColor: 'linear-gradient(' +
          '45deg,' +
          '#eab566 30%,' +
          '#ff3636 90%' +
        ') !important',
        navbarFilterFilledBtnTextColor: 'black',
        '--blockHighlightcolor': 'rgb(255, 255, 255)',
        '--legendColor': '#e1e1e1',
        '--plotBorderColor': '0px solid rgba(185, 185, 185, 0)',
      },
      plotColors: {
        single_line_color: "steelblue",
        multi_line_color: [],//["red", "green", "blue", "steelblue"],
        plot_bgcolor: "#e0e9f4",
        paper_bgcolor: "white",
        xaxis_color: "none",
        xaxis_line_color: "none",
        xaxis_grid_color: "white",
        yaxis_grid_color: "white",
        legend_text_color: "black",
        title_color: "rgb(68, 68, 68);",
        scatterMapColorScale: [
          [0,'rgb(5, 10, 172)'],
          [0.35,'rgb(40, 60, 190)'],
          [0.5,'rgb(70, 100, 245)'],
          [0.6,'rgb(90, 120, 245)'],
          [0.7,'rgb(106, 137, 247)'],
          [1,'rgb(220, 220, 220)']
        ],
      },
    });

export const darkTheme = createTheme({
      palette: {
        mode: "dark",
      },
      customThemes: {
        '--mainContentBackground': 'linear-gradient(' +
          '337deg,' +
          'rgba(0, 0, 0, 1) 0%,' +
          'rgba(0, 119, 145, 1) 35%,' +
          'rgba(44, 21, 110, 1) 70%,' +
          'rgba(75, 0, 130, 1) 100%' +
        ')',
        '--widgetColor': 'rgb(61, 168, 255)',
        widgetColor: 'rgba(144,202,249,1)',
        '--navbarElementColor': '#000000',
        '--navbarBackground': 'rgb(75 215 245)',//'#5acfb6',
        '--navbarDropdownSelectionItems': 'rgba(255, 255, 0, 0.81)',
        '--navbarSelectedDropdownItem': 'rgba(255, 255, 0, 0.81)',
        '--navbarDropdownArrow': 'rgba(255, 255, 0, 0.81)',
        '--sidebarColor': '#222',
        '--sidebarButtonColor': 'white',
        '--sidebarTitleColor': 'rgb(75 215 245)',
        '--sidebarBorder': '0px solid rgba(0,0,0,0)',
        '--logoHueOffset': '90deg',
        '--logoSaturationOffset': '1',
        '--navbarBtnTextColor': 'white',
        '--navbarBtnBoarderColor': 'white',
        '--navbarBtnFillColor': 'none',
        '--sidebarFilterBackground': 'rgba(255, 7, 7, 0)',
        navbarFilterBtnColor: 'linear-gradient(' +
          '45deg,' +
          '#667eea 30%,' +
          '#764ba2 90%' +
        ')',
        navbarFilterFilledBtnTextColor: 'white',
        '--blockHighlightcolor': 'rgb(38, 38, 38)',
        '--legendColor': 'rgb(38, 38, 38)',
        '--plotBorderColor': '3px solid rgba(185, 185, 185, 0.2)',
      },
      plotColors: {
        single_line_color: "steelblue",
        multi_line_color: [],//["red", "green", "blue", "steelblue"],
        plot_bgcolor: "white",
        paper_bgcolor: 'linear-gradient(' +
          '337deg,' +
          'rgba(0, 0, 0, 1) 0%,' +
          'rgba(0, 119, 145, 1) 35%,' +
          'rgba(44, 21, 110, 1) 70%,' +
          'rgba(75, 0, 130, 1) 100%' +
        ')',//"#121212",
        xaxis_color: "white",
        yaxis_color: "white",
        //xaxis_line_color: "none",
        xaxis_grid_color: "#e2dcdc",
        yaxis_grid_color: "#e2dcdc",
        legend_text_color: "white",
        title_color: "white",
        scatterMapColorScale: [
          [0,'rgb(5, 10, 172)'],
          [0.35,'rgb(40, 60, 190)'],
          [0.5,'rgb(70, 100, 245)'],
          [0.6,'rgb(90, 120, 245)'],
          [0.7,'rgb(106, 137, 247)'],
          [1,'rgb(220, 220, 220)']
        ],
      },
    });