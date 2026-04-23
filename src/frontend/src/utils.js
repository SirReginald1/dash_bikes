/**
 * Finds the indexes of the 
 * @param {Array} array The array of elements to be searched.
 * @param {Int, float, String} toFind The element to be found in the array.
 * @returns Array of indexes at which the provided element can be found in the
 *  searched array.
 */
export function getIndexes(array, toFind){
    return(
        array.map(
                (element, index) => (element === toFind ? index : -1)
            ).filter((index) => index !== -1)
    )
}


/**
 * Returns the indexes of the data than possess all the provided values.
 * @param {Object} data The object containing the data to be filtered.
 * @param {Map} matchValues A map containing variable names as keys
 *  and values as values. For multiple values in the same variable make
 *  2 separate entries.
 * @returns Array of data indexes that verify all the provided conditions.
 */
export function filterByValues(data, matchValues){
    let indexSets = Array.from(matchValues.keys()).map(
        (key) => (
            new Set(getIndexes(data[key], matchValues.get(key)))
        )
    )
    let out = indexSets[0]
    for(let i=1;i<indexSets.length;i++){
        out = out.intersection(indexSets[i])
    }
    return(Array.from(out))
}

/**
 * Counts the number of occurrences of each values present in
 *  valuesToCount in the data.
 * @param {Object} data The data object containing the variable to count.
 * @param {Array} valuesToCount The array containing the values to be
 *  counted.
 * @returns Array containing the count for each of the values provided in
 *  valuesToCount. The counts are in the same order as in valuesToCount.
 */
export function countValues(data, valuesToCount, variable){
    let count = new Array(valuesToCount.length)
    let filterMap = new Map()
    for(let i=0;i<valuesToCount.length;i++){
        filterMap.set(variable, valuesToCount[i])
        count[i] = filterByValues(
            data,
            filterMap
        ).length
    }
    return(count)
}

/**
     * Calculates the rolling average for the values in the provided array.
     * @param {Array} values The array of values to calculate the rolling average
     *  for.
     * @param {Array} windowWidth The size of the averaging window.
     * @returns The array with the calculated rolling averages. Array is of
     *  same size as the values array. Buffer values are undefined.
     */
    export function rollingAverage(values, windowWidth){
        let out = new Array(values.length)
        let halfWidth = Math.round(windowWidth/2)
        for(let i=0;i<halfWidth;i++){
            out[i] = undefined
            out[i + values.length - halfWidth] = undefined
        }
        for(let i=halfWidth;i<values.length - halfWidth;i++){
            out[i] = values.slice(0 + i, windowWidth + i).reduce(
                (acc, currentVal) => {return(acc + currentVal)},
                0
            ) / windowWidth
        }
        return(out)
    }

    /**
     * Calculates the seasonal data for the time series.
     * @param {Object} data Object containing the original data.
     * @param {Array} monthList Array of ordered months.
     * @param {Array} uniqueYears Array of ordered years to calculate seasonal
     *  data for.
     * @returns Array containing the seasonal values. Of length monthList.
     */
    export function calculateSeasonalData(data, monthList, uniqueYears){
        let out = new Array(monthList.length)
        let filterMap = new Map()
        for(let i=0;i<monthList.length;i++){
            filterMap.set("mois", monthList[i])
            let yearValues = 0 
            for(let j=0;j<uniqueYears.length;j++){
                filterMap.set('an', uniqueYears[j])
                yearValues += filterByValues(
                    data,
                    filterMap
                ).length
            }
            out[i] = yearValues / uniqueYears.length
        }
        return(out)
    }

    /**
     * Concatenates the provided array with its self nbRepeats times.
     * @param {Array} seasonalData Array containing the seasonal data.
     * @param {Int} nbRepeats The number of concatenations.
     * @returns Array of concatenated seasonal data.
     */
    export function concatSeasonalData(seasonalData, nbRepeats){
        let out = seasonalData
        for(let i=0;i<nbRepeats-1;i++){
            out = out.concat(seasonalData)
        }
        return(out)
    }

    /**
     * Calculates the residual data.
     * @param {Array} originalData Array containing original data.
     * @param {Array} averagedData Array containing rolling averages.
     * @param {Array} seasonalData Array containing the seasonal data.
     * @returns Array containing the residual data.
     */
    export function calcResidualsData(originalData,
                                      averagedData,
                                      seasonalData){
        return(
            originalData.map(
                (value, index) => {
                    return(
                        value - averagedData[index] - seasonalData[index]
                    )
                }
            )
        )
    }

export const monthList = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
]
