//TODO: add error conditions to help debugging
//TODO: Optimize groupDataIdx function

/**
 * Indicates if the provided var is categorical.
 * @param {Object} metadata The metadata for the provided variable.
 * @param {Object | undefined} data The array containing the data to be
 *  checked.
 * @returns boolean True if the variable can be considered as categorical.
 *  Else false.
 */
export function isCategorical(metadata, data = undefined){
    return(Object.hasOwn(metadata, "keys"))
}

/**
 * Finds the indexes of the at which the provided element can be found in the
 *  the array.
 * @param {Iterable} array The array of elements to be searched.
 * @param {Number | String | Set[Number | String]} values The element to be
 *  found in the array.
 * @param {Iterable} subsetIdx Array containing the indexes to which the search
 *  will be limited.
 * @returns Array of indexes at which the provided element can be found in the
 *  searched array.
 */
export function getIndexes(array, values, subsetIdx = undefined){
    let out = []
    if(subsetIdx !== undefined && typeof subsetIdx[Symbol.iterator] === 'function'){
        if(values instanceof Set){
            for(const filterIdx of subsetIdx){
                if(values.has(array[filterIdx])){
                    out.push(filterIdx)
                }
            }
            return(out)
        }
        else{
            for(const filterIdx of subsetIdx){ 
                if(values === array[filterIdx]){
                    out.push(filterIdx)
                }  
            }
            return(out)
        }
    }
    if(values instanceof Set){
        for(let i=0;i<array.length;i++){
            if(values.has(array[i])){
                out.push(i)
            }
        }
        return(out)
    }
    for(let i=0;i<array.length;i++){
        if(values === array[i]){
            out.push(i)
        }
    }
    return(out)
}

/**
 * Returns the indexes of all numbers in the array that are in-between or
 * equal the brackets.
 * @param {Array[Number]} array Array containing numbers to be compared.
 * @param {Array[Number]} bracket Array with smallest bracket as first element
 *  and largest bracket as second element.
 * @returns Array of indexes in the array that are in-between or equal to the
 * provided brackets.
 */
export function getIndexContinuBracket(array, bracket){
    let out = []
    for(let i=0;i<array.length;i++){
        if(array[i] >= bracket[0] & array[i] <= bracket[1]){
            out.push(i)
        }
    }
    return(out)
}

/**
 * Returns the indexes of all numbers in the array that are in-between or
 * equal the brackets.
 * @param {Array[Number]} array Array containing numbers to be compared.
 * @param {Array[Number]} bracket Array with smallest bracket as first element
 *  and largest bracket as second element.
 * @param {Number} includeValue A value to include even if outside the provided
 *  bracket. Used to include null values when selecting continuous variables
 *  with a slider. !!! Warning will not work if the value to include is
 *  undefined !!!
 * @returns Set of indexes in the array that are in-between or equal to the
 * provided brackets.
 */
export function getIndexContinuBracketSet(array, bracket, includeValue = undefined){
    let out = new Set()
    if(includeValue === undefined){
        for(let i=0;i<array.length;i++){
            if(array[i] >= bracket[0] & array[i] <= bracket[1]){
                out.add(i)
            }
        }
    }
    else{
        for(let i=0;i<array.length;i++){
            if((array[i] >= bracket[0] & array[i] <= bracket[1]) |
                includeValue === array[i]){
                out.add(i)
            }
        }
    }
    return(out)
}

/**
 * Finds the indexes of the at which the provided element can be found in the
 *  the array.
 * @param {Iterable} array The array of elements to be searched.
 * @param {Number | String | Set[Number | String]} values The element to be
 *  found in the array.
 * @param {Iterable} subsetIdx Array containing the indexes to which the search
 *  will be limited.
 * @returns Set of indexes at which the provided element can be found in the
 *  searched array.
 */
export function getIndexesSet(array, values, subsetIdx = undefined){
    let out = new Set()
    if(subsetIdx !== undefined && typeof subsetIdx[Symbol.iterator] === 'function'){
        if(values instanceof Set){
            for(const filterIdx of subsetIdx){
                if(values.has(array[filterIdx])){
                    out.add(filterIdx)
                }
            }
            return(out)
        }
        else{
            for(const filterIdx of subsetIdx){
                if(values === array[filterIdx]){
                    out.add(filterIdx)
                }
            }
            return(out)
        }
    }
    if(values instanceof Set){
        for(let i=0;i<array.length;i++){
            if(values.has(array[i])){
                out.add(i)
            }
        }
        return(out)
    }
    for(let i=0;i<array.length;i++){
        if(values === array[i]){
            out.add(i)
        }
    }
    return(out)
}

/**
 * Concatenate all the values in the provided map.
 * @param {Map<String, Set>} map Map with sets as values.
 * @param {Set[String]} excludedVars Set containing the variables to exclude
 * from the concatenation. Default undefined.
 * @returns Set containing the intersection of all sets in the map.
 */
export function concatIdxMap(map, excludedVars = undefined){
    //let setsIter = map.values()
    //let nextIter = setsIter.next()
    //let out = nextIter.value
    //console.log(`iter val type: ${typeof(out)}`)
    //console.log(`iter val is set: ${out instanceof Set}`)
    //setsIter.next()
    //while(!nextIter.done){
    //    out = out.intersection(setsIter.value)
    //    setsIter.next()
    //}
    //return(out)
    let vals = [...map.values()]
    let out = vals[0]
    for(let i=1;i<map.size;i++){
        out = vals[i].intersection(out)
    }
    return(out)
}

/**
 * Concatenate all the values in the provided map.
 * @param {Map<String, Set>} map Map with sets as values.
 * @param {Set[String]} excludedVars Set containing the variables to exclude
 * from the concatenation. Default undefined.
 * @returns Set containing the intersection of all sets in the map.
 */
export function concatIdxMapSet(map, excludedVars = undefined){
    let out = new Set()
    if(map.size === 0){
        return(out)
    }
    let iterator = map.entries()
    if(excludedVars === undefined){
        out = iterator.next().value[1]
        for(let [k, v] of iterator){
            out = out.intersection(v)
        }
        return(out)
    }
    let firstEntry = iterator.next()
    if(excludedVars.has(firstEntry.key)){
        out = iterator.next().value[1]
    }
    else{
        out = firstEntry.value[1]
    }
    for(let [k, v] of iterator){
        if(!excludedVars.has(k))
            out = out.intersection(v)
    }
    return(out)
}

/**
 * Extracts the values for each of the provided variables and indexes.
 * @param {Object} data The object containing the data.
 * @param {Array[String]} variables Array of variable names that are present in
 *  the data objects.
 * @param {Iterable} indexes Iterable containing the indexes of the values to
 *  be extracted for each of the provided variables.
 * @returns Map containing
 */
export function extractValues(data, variables, indexes){
    let out = new Map()
    //let nextIdx = iterator.next()
    for(const variable of variables){
        let idxList = []
        let iter = indexes[Symbol.iterator]()
        for(const indexe of indexes){
            idxList.push(data[variable][iter.next().value])
        }
        out.set(variable, idxList)
    }
    return(out)
}

/**
 * Returns the indexes of the data than possess all the provided values.
 * To increase speed place rarest values as first elements of matchValues.
 * @param {Object} data The object containing the data to be filtered.
 * @param {Map<String, any>} matchValues A map containing variable names as
 * keys and values as values. For multiple values in the same variable make
 * 2 separate entries.
 * @param {Iterable} subsetIdx Iterable containing the indexes to which the search
 *  will be limited.
 * @returns Array of data indexes that verify all the provided conditions.
 */
export function filterByValues(data, matchValues, subsetIdx = undefined){
    let out = subsetIdx
    for(const [key, value] of matchValues){
        out = getIndexes(data[key], matchValues.get(key), out)
    }
    return(out)
}

/**
 * Returns the indexes of the data than possess all the provided values.
 * @param {Object} data The object containing the data to be filtered.
 * @param {Map} matchValues A map containing variable names as keys
 *  and values as values. For multiple values in the same variable make
 *  2 separate entries.
 * @returns Set of data indexes that verify all the provided conditions.
 */
export function filterByValuesSet(data, matchValues){
    let indexSets = Array.from(matchValues.keys()).map(
        (key) => (
            new Set(getIndexes(data[key], matchValues.get(key)))
        )
    )
    let out = indexSets[0]
    for(let i=1;i<indexSets.length;i++){
        out = out.intersection(indexSets[i])
    }
    return(out)
}

/**
 * For a given filter map and given data will return a map if indexes
 * for each Set of values in the filter map.
 * @param {Object} data The javascript object containing the data.
 * @param {Map<String, Set>} filterMap Map with variable names as keys and
 * and Sets of values to be found in the key variable data.
 * @param {Set[String]} excludeVars Set containing all the variables that
 * should not be included in outputted map. If Set contains variables that
 * are not in the data they are ignored.
 * @param {Set[Number]} subsetIdx Set containing the indexes that should not
 * be included in the output.
 * @returns Map with variables as keys and Sets of indexes as values.
 */
export function extractIdxFromFilterMap(data,
                                        filterMap,
                                        excludeVars = undefined,
                                        subsetIdx = undefined){
    let out = new Map()
    if(excludeVars == undefined){
        for(let [k, v] of filterMap){
            out.set(k, getIndexesSet(data[k], v, subsetIdx))
        }
        return(out)
    }
    for(let [k, v] of filterMap){
        if(!usedExcludedVars.has(k)){
            out.set(k, getIndexesSet(data[k], v, subsetIdx))
        }
    }
    return(out)

}

/**
 * Builds a map with the class label as key and array of indexes for each
 *  class.
 * @param {Object} data The object containing the data.
 * @param {String} variable The name of the variable.
 * @param {Array} groups Array of arrays containing the group name in first
 *  position and array of min and max group values in second position.
 * @param {Set} idxSubset Optional set of valid index subset.
 *  Default: undefined.
 * @returns Map with class label as keys and array of index of each element in
 *  the class as values.
 */
export function groupDataIdx(data, variable, groups, idxSubset = undefined){
    let out = new Map()
    for(const [key, value] of Object.entries(groups)){
        if(idxSubset instanceof Set){
            out.set(
                key,
                [...new Set(
                    data[variable].map((number, index) => {
                        if(number >= value[0] && number <= value[1]){
                            return(index)
                        }
                        return(-1)
                    }).filter((index) => index !== -1)
                ).intersection(idxSubset)]
            )
        }
        else{
            out.set(
                key,
                data[variable].map((number, index) => {
                    if(number >= value[0] && number <= value[1]){
                        return(index)
                    }
                    return(-1)
                }).filter((index) => index !== -1)
            )
        }
    }
    return(out)
}

/**
 * Builds a map with the class label as key and sets of indexes for each
 *  class.
 * @param {Object} data The object containing the data.
 * @param {String} variable The name of the variable.
 * @param {Array} groups Array of arrays containing the group name in first
 *  position and array of min and max group values in second position.
 * @param {Set} idxSubset Optional set of valid index subset.
 *  Default: undefined.
 * @returns Map with class label as keys and sets of index of each element in
 *  the class as values.
 */
export function groupDataIdxSet(data, variable, groups, idxSubset = undefined){
    let out = new Map()
    for(const [key, value] of Object.entries(groups)){
        if(idxSubset instanceof Set){
            out.set(
                key,
                new Set(
                    data[variable].map((number, index) => {
                        if(number >= value[0] && number <= value[1]){
                            return(index)
                        }
                        return(-1)
                    }).filter((index) => index !== -1)
                ).intersection(idxSubset)
            )
        }
        else{
            out.set(
                key,
                new Set(
                    data[variable].map((number, index) => {
                        if(number >= value[0] && number <= value[1]){
                            return(index)
                        }
                        return(-1)
                    }).filter((index) => index !== -1)
                )
            )
        }
        
    }
    
    return(out)
}

/**
 * Builds map of indexes for each variable.
 * @param {Object} data The object containing the data.
 * @param {Object} variableKeyMap The object containing variable metadata.
 * @param {String} variable The name of the variable.
 * @param {Set} idxSubset Optional set of valid index subset.
 *  Default: undefined.
 * @returns Map with variable labels as keys and array of indexes at which
 *  the value can be found.
 */
export function getIndexesCategorical(data, 
                                      variableKeyMap,
                                      variable,
                                      idxSubset = undefined){
    // Then is categorical data
    let out = new Map()
    if(Object.hasOwn(variableKeyMap[variable], "keys")){
        let varEntries = Object.entries(variableKeyMap[variable]["keys"])
        for(const [value, key] of varEntries){
            let indexes = getIndexes(
                data[variable],
                Number(value)
            )
            if(idxSubset instanceof Set){
                out.set(
                    key,
                    [...new Set(indexes).intersection(idxSubset)]
                )
            }
            else{
                out.set(key, indexes)
            }
            
        }
    }
    // Then is continuous data with specified groupings
    else if(Object.hasOwn(variableKeyMap[variable], "cat_group")){
        out = groupDataIdx(
            data,
            variable,
            variableKeyMap[variable]["cat_group"],
            idxSubset = idxSubset
        )
    }
    return(out)
}

/**
 * Builds map of indexes for each variable.
 * @param {Object} data The object containing the data.
 * @param {Object} variableKeyMap The object containing variable metadata.
 * @param {String} variable The name of the variable.
 * @param {Set} idxSubset Optional set of valid index subset.
 *  Default: undefined.
 * @returns Map with variable labels as keys and sets of indexes at which
 *  the value can be found.
 */
export function getIndexesCategoricalSet(data, 
                                         variableKeyMap,
                                         variable,
                                         idxSubset = undefined){
    // Then is categorical data
    let out = new Map()
    if(Object.hasOwn(variableKeyMap[variable], "keys")){
        let varEntries = Object.entries(variableKeyMap[variable]["keys"])
        for(const [value, key] of varEntries){
            let indexSet = getIndexesSet(
                data[variable],
                Number(value)
            )
            if(idxSubset instanceof Set){
                out.set(
                    key,
                    indexSet.intersection(idxSubset)
                )
            }
            else{
                out.set(key, indexSet)
            }
            
        }
    }
    // Then is continuous data with specified groupings
    else if(Object.hasOwn(variableKeyMap[variable], "cat_group")){
        out = groupDataIdxSet(
            data,
            variable,
            variableKeyMap[variable]["cat_group"],
            idxSubset = idxSubset
        )
    }
    return(out)
}

/**
 * Builds an array containing all year between the years provided in the
 * selectedYears array.
 * @param {Array} selectedYears Array of length 2 with smallest year as fist
 *  element and largest year as second element.
 * @returns An array containing all the years in order between the provided
 * ones.
 */
export function buildSelectedYearSet(selectedYears){
        let years = new Set()
        for(let i=selectedYears[0];i<=selectedYears[1];i++){
            years.add(i)
        }
        return(years)
    }

/**
 * Builds a map with the class label as key and number of instances
 * of that class as values.
 * @param {Object} data The object containing the data.
 * @param {String} variable The name of the variable.
 * @param {Array} groups Array of arrays containing the group name in first
 *  position and array of min and max group values in second position.
 * @param {Array} idxSubset Optional array of valid data row to compare.
 *  Default: undefined.
 * @returns Map with class label as keys and number of instances of key class
 *  as values. 
 */
export function groupDataCount(data, variable, groups, idxSubset = undefined){
    //console.log("Entered: groupDataCount")
    let out = new Map()
    if(idxSubset !== undefined){
        //console.log(`Yes subset: ${idxSubset}`)
        for(const [key, value] of Object.entries(groups)){
            //console.log(`key: ${key}, val1: ${value[0]}, val2: ${value[1]}`)
            let count = idxSubset.map(
                (idxSubsetVal) => {
                    //console.log(`data idx: ${idxSubsetVal}, data val: ${data[variable][idxSubsetVal]} | cond1: ${data[variable][idxSubsetVal] >= value[0]}, cond2: ${data[variable][idxSubsetVal] <= value[1]}`)
                    if(data[variable][idxSubsetVal] >= value[0] &
                        data[variable][idxSubsetVal] <= value[1]){
                        return(idxSubsetVal)
                    }
                    return(-1)
                }
            ).filter((value) => value !== -1).length
            //console.log(`count: ${count}`)
            out.set(key, count)
        }
        return(out)
    }
    else{
       //console.log("No subset")
        for(const [key, value] of Object.entries(groups)){
            out.set(
                key,
                data[variable].map((number, index) => {
                    if(number >= value[0] && number <= value[1]){
                        return(index)
                    }
                    return(-1)
                }).filter((index) => index !== -1).length
            )
            //console.log(`key: ${key}, val: ${value}, count: ${out[key]}`)
        }
        return(out) 
    }
}

//export function countValsBetween(data, bracketValues){
//    if(bracketValues instanceof Map){
//        Object.keys(bracketValues).map(
//            (key) => {
//                bracketValues[key]
//            }
//        )
//    }
//    if(bracketValues instanceof Array){
//
//    }
//
//}
//
//export function groupDataValToKey(data, variable, groups){
//    let out = new Map()
//    for(const [key, value] of Object.entries(groups)){
//        out.set(
//            key,
//            data[variable].map((number, index) => {
//                if(number >= value[0] && number <= value[1]){
//                    return(index)
//                }
//                return(-1)
//            }).filter((index) => index !== -1)
//        )
//    }
//    return(out)
//}

/**
 * Counts the number of occurrences of each values present in
 *  valuesToCount in the data.
 * @param {Object} data The data object containing the variable to count.
 * @param {Array} valuesToCount The array containing the values to be
 *  counted.
 * @param {String} variable The name of the variable in which to look for the
 *  values.
 * @param {Array} idxSubset Optional array of valid data row to compare.
 *  Default: undefined.
 * @returns Array containing the count for each of the values provided in
 *  valuesToCount. The counts are in the same order as in valuesToCount.
 */
export function countValues(data,
                            valuesToCount,
                            variable,
                            idxSubset = undefined){
    let count = new Array(valuesToCount.length)
    let filterMap = new Map()
    for(let i=0;i<valuesToCount.length;i++){
        filterMap.set(variable, valuesToCount[i])
        count[i] = filterByValues(
            data,
            filterMap,
            idxSubset
        ).length
    }
    return(count)
}

/**
 * 
 * @param {*} data 
 * @param {*} variableKeyMap 
 * @param {*} variable 
 * @param {*} idxSubset 
 * @returns 
 */
export function getCatPlotValsAndLabs(data,
                                      variableKeyMap,
                                      variable,
                                      idxSubset = undefined){
    if(Object.hasOwn(variableKeyMap[variable], "keys")){
        let labels = Object.values(variableKeyMap[variable]["keys"])
        let keyValues = Object.keys(variableKeyMap[variable]["keys"])
        let values = []
        if(idxSubset instanceof Set){
            values = countValuesWithSubset(
                data,
                keyValues,
                variable,
                idxSubset
            )
        }
        else{
            values = countValues(data, keyValues, variable)
        }
        return([labels, values])
    }
    if(Object.hasOwn(variableKeyMap[variable], "cat_group")){
        let countMap = groupDataCount(
            data,
            variable,
            variableKeyMap[variable]["cat_group"],
            idxSubset = idxSubset
        )
        //console.log(`getCatPlotValsAndLabs: count map: ${Object.entries(countMap).length}`)
        let labels = []
        let values = []
        for(const [key, value] of countMap){
            labels.push(key)
            values.push(value)
        }
        return([labels, values])
    }
    throw new Error(`Nether "keys" nor "cat_group" attributes exist for
                    variable: ${variable} in variableKeyMap object.`)
}

/**
 * Counts the number of occurrences of each values present in
 *  valuesToCount in the data.
 * @param {Object} data The data object containing the variable to count.
 * @param {Array} valuesToCount The array containing the values to be
 *  counted.
 * @param {String} variable The name of the variable in which to look for the
 *  values.
 * @param {Set} idxSubset Set of indexes that represent the subset indexes.
 * @returns Array containing the count for each of the values provided in
 *  valuesToCount. The counts are in the same order as in valuesToCount.
 */
export function countValuesWithSubset(data,
                                      valuesToCount,
                                      variable,
                                      idxSubset){
    //console.log(`valuesToCount: ${valuesToCount}`)
    //console.log(`variable: ${variable}`)
    //console.log(`subsetFilter: ${Array.from(subsetFilter)}`)
    //console.log(`idxSubset: ${idxSubset}`)
    let count = new Array(valuesToCount.length)
    let filterMap = new Map()
    for(let i=0;i<valuesToCount.length;i++){
        filterMap.set(variable, valuesToCount[i])
        count[i] = filterByValuesSet(
            data,
            filterMap
        ).intersection(idxSubset).size
        //console.log(`idx: ${i}, set: ${Array.from(count[i])}`)
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
 * Calculates the absolute value residual data.
 * @param {Array} originalData Array containing original data.
 * @param {Array} averagedData Array containing rolling averages.
 * @param {Array} seasonalData Array containing the seasonal data.
 * @returns Array containing the absolute value residual data.
 */
export function calcResidualsData(originalData,
                                  averagedData,
                                  seasonalData){
    return(
        originalData.map(
            (value, index) => {
                return(
                    Math.abs(value - averagedData[index] - seasonalData[index])
                )
            }
        )
    )
}

/**
 * Returns true if all elements in the array are integers.
 * @param {Array} array Array of elements to test.
 * @returns Boolean indicating if all elements of the array are integers.
 */
export function isInteger(array){
    let out = true
    for(let i=0;i<array.length;i++){
        out = out & Number.isInteger(array[i])
    }
    return(out)
}

/**
 * Maps each departement to the region in which it is situated.
 * Keys and values are of type string.
 */
export const depToRegCodeMap = new Map(
    [
        ["01", "84"],
        ["02", "32"],
        ["03", "84"],
        ["04", "93"],
        ["05", "93"],
        ["06", "93"],
        ["07", "84"],
        ["08", "44"],
        ["09", "76"],
        ["10", "44"],
        ["11", "76"],
        ["12", "76"],
        ["13", "93"],
        ["14", "28"],
        ["15", "84"],
        ["16", "75"],
        ["17", "75"],
        ["18", "24"],
        ["19", "75"],
        ["21", "27"],
        ["22", "53"],
        ["23", "75"],
        ["24", "75"],
        ["25", "27"],
        ["26", "84"],
        ["27", "28"],
        ["28", "24"],
        ["29", "53"],
        ["2A", "94"],
        ["2B", "94"],
        ["30", "76"],
        ["31", "76"],
        ["32", "76"],
        ["33", "75"],
        ["34", "76"],
        ["35", "53"],
        ["36", "24"],
        ["37", "24"],
        ["38", "84"],
        ["39", "27"],
        ["40", "75"],
        ["41", "24"],
        ["42", "84"],
        ["43", "84"],
        ["44", "52"],
        ["45", "24"],
        ["46", "76"],
        ["47", "75"],
        ["48", "76"],
        ["49", "52"],
        ["50", "28"],
        ["51", "44"],
        ["52", "44"],
        ["53", "52"],
        ["54", "44"],
        ["55", "44"],
        ["56", "53"],
        ["57", "44"],
        ["58", "27"],
        ["59", "32"],
        ["60", "32"],
        ["61", "28"],
        ["62", "32"],
        ["63", "84"],
        ["64", "75"],
        ["65", "76"],
        ["66", "76"],
        ["67", "44"],
        ["68", "44"],
        ["69", "84"],
        ["70", "27"],
        ["71", "27"],
        ["72", "52"],
        ["73", "84"],
        ["74", "84"],
        ["75", "11"],
        ["76", "28"],
        ["77", "11"],
        ["78", "11"],
        ["79", "75"],
        ["80", "32"],
        ["81", "76"],
        ["82", "76"],
        ["83", "93"],
        ["84", "93"],
        ["85", "52"],
        ["86", "75"],
        ["87", "75"],
        ["88", "44"],
        ["89", "27"],
        ["90", "27"],
        ["91", "11"],
        ["92", "11"],
        ["93", "11"],
        ["94", "11"],
        ["95", "11"],
        ["971", "1"],
        ["972", "2"],
        ["973", "3"],
        ["974", "4"]
    ]
)

/**
 * Maps region codes to list of departement codes contained in the region.
 * Keys and values are of type string.
 * Modern groupings may not work with older datasets.
 */
export const depsInRegCodeMap = new Map(
    [
        ["84", ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74']],
        ["32", ['02', '59', '60', '62', '80']],
        ["93", ['04', '05', '06', '13', '83', '84']],
        ["44", ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88']],
        ["76", ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82']],
        ["28", ['14', '27', '50', '61', '76']],
        ["75", ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87']],
        ["24", ['18', '28', '36', '37', '41', '45']],
        ["27", ['21', '25', '39', '58', '70', '71', '89', '90']],
        ["53", ['22', '29', '35', '56']],
        ["94", ['2A', '2B']],
        ["52", ['44', '49', '53', '72', '85']],
        ["11", ['75', '77', '78', '91', '92', '93', '94', '95']],
        ["1", ['971']],
        ["2", ['972']],
        ["3", ['973']],
        ["4", ['974']]
    ]
)

/**
 * Maps region code to its name.
 * Keys and values are of type string.
 */
export const regCodeToNameMap = new Map(
    [
        ["1" ,"Guadeloupe"],
        ["2" ,"Martinique"],
        ["3" ,"Guyane"],
        ["4" ,"La Réunion"],
        ["11" ,"Île-de-France"],
        ["24" ,"Centre-Val de Loire"],
        ["27" ,"Bourgogne-Franche-Comté"],
        ["28" ,"Normandie"],
        ["32" ,"Hauts-de-France"],
        ["44" ,"Grand Est"],
        ["52" ,"Pays de la Loire"],
        ["53" ,"Bretagne"],
        ["75" ,"Nouvelle-Aquitaine"],
        ["76" ,"Occitanie"],
        ["84" ,"Auvergne-Rhône-Alpes"],
        ["93" ,"Provence-Alpes-Côte d'Azur"],
        ["94" ,"Corse"]
    ]
)

/**
 * Maps region name to its code.
 * Keys and values are of type string.
 */
export const regNameToCodeMap = new Map(
    [
        ["Guadeloupe" ,"1"],
        ["Martinique" ,"2"],
        ["Guyane" ,"3"],
        ["La Réunion" ,"4"],
        ["Île-de-France" ,"11"],
        ["Centre-Val de Loire" ,"24"],
        ["Bourgogne-Franche-Comté" ,"27"],
        ["Normandie" ,"28"],
        ["Hauts-de-France" ,"32"],
        ["Grand Est" ,"44"],
        ["Pays de la Loire" ,"52"],
        ["Bretagne" ,"53"],
        ["Nouvelle-Aquitaine" ,"75"],
        ["Occitanie" ,"76"],
        ["Auvergne-Rhône-Alpes" ,"84"],
        ["Provence-Alpes-Côte d'Azur" ,"93"],
        ["Corse" ,"94"]
    ]
)

/**
 * Maps department code to its name.
 * Keys and values are of type string.
 */
export const depCodeToNameMap = new Map(
    [
        ["01" ,"Ain"],
        ["02" ,"Aisne"],
        ["03" ,"Allier"],
        ["04" ,"Alpes-de-Haute-Provence"],
        ["05" ,"Hautes-Alpes"],
        ["06" ,"Alpes-Maritimes"],
        ["07" ,"Ardèche"],
        ["08" ,"Ardennes"],
        ["09" ,"Ariège"],
        ["10" ,"Aube"],
        ["11" ,"Aude"],
        ["12" ,"Aveyron"],
        ["13" ,"Bouches-du-Rhône"],
        ["14" ,"Calvados"],
        ["15" ,"Cantal"],
        ["16" ,"Charente"],
        ["17" ,"Charente-Maritime"],
        ["18" ,"Cher"],
        ["19" ,"Corrèze"],
        ["21" ,"Côte-d'Or"],
        ["22" ,"Côtes-d'Armor"],
        ["23" ,"Creuse"],
        ["24" ,"Dordogne"],
        ["25" ,"Doubs"],
        ["26" ,"Drôme"],
        ["27" ,"Eure"],
        ["28" ,"Eure-et-Loir"],
        ["29" ,"Finistère"],
        ["2A" ,"Corse-du-Sud"],
        ["2B" ,"Haute-Corse"],
        ["30" ,"Gard"],
        ["31" ,"Haute-Garonne"],
        ["32" ,"Gers"],
        ["33" ,"Gironde"],
        ["34" ,"Hérault"],
        ["35" ,"Ille-et-Vilaine"],
        ["36" ,"Indre"],
        ["37" ,"Indre-et-Loire"],
        ["38" ,"Isère"],
        ["39" ,"Jura"],
        ["40" ,"Landes"],
        ["41" ,"Loir-et-Cher"],
        ["42" ,"Loire"],
        ["43" ,"Haute-Loire"],
        ["44" ,"Loire-Atlantique"],
        ["45" ,"Loiret"],
        ["46" ,"Lot"],
        ["47" ,"Lot-et-Garonne"],
        ["48" ,"Lozère"],
        ["49" ,"Maine-et-Loire"],
        ["50" ,"Manche"],
        ["51" ,"Marne"],
        ["52" ,"Haute-Marne"],
        ["53" ,"Mayenne"],
        ["54" ,"Meurthe-et-Moselle"],
        ["55" ,"Meuse"],
        ["56" ,"Morbihan"],
        ["57" ,"Moselle"],
        ["58" ,"Nièvre"],
        ["59" ,"Nord"],
        ["60" ,"Oise"],
        ["61" ,"Orne"],
        ["62" ,"Pas-de-Calais"],
        ["63" ,"Puy-de-Dôme"],
        ["64" ,"Pyrénées-Atlantiques"],
        ["65" ,"Hautes-Pyrénées"],
        ["66" ,"Pyrénées-Orientales"],
        ["67" ,"Bas-Rhin"],
        ["68" ,"Haut-Rhin"],
        ["69" ,"Rhône"],
        ["70" ,"Haute-Saône"],
        ["71" ,"Saône-et-Loire"],
        ["72" ,"Sarthe"],
        ["73" ,"Savoie"],
        ["74" ,"Haute-Savoie"],
        ["75" ,"Paris"],
        ["76" ,"Seine-Maritime"],
        ["77" ,"Seine-et-Marne"],
        ["78" ,"Yvelines"],
        ["79" ,"Deux-Sèvres"],
        ["80" ,"Somme"],
        ["81" ,"Tarn"],
        ["82" ,"Tarn-et-Garonne"],
        ["83" ,"Var"],
        ["84" ,"Vaucluse"],
        ["85" ,"Vendée"],
        ["86" ,"Vienne"],
        ["87" ,"Haute-Vienne"],
        ["88" ,"Vosges"],
        ["89" ,"Yonne"],
        ["90" ,"Territoire de Belfort"],
        ["91" ,"Essonne"],
        ["92" ,"Hauts-de-Seine"],
        ["93" ,"Seine-Saint-Denis"],
        ["94" ,"Val-de-Marne"],
        ["95" ,"Val-d'Oise"],
        ["971" ,"Guadeloupe"],
        ["972" ,"Martinique"],
        ["973" ,"Guyane"],
        ["974" ,"La Réunion"],
    ]
) 

/**
 * Maps department name to its code.
 * Keys and values are of type string.
 */
export const depNameToCodeMap = new Map(
    [
        ["Ain" ,"01"],
        ["Aisne" ,"02"],
        ["Allier" ,"03"],
        ["Alpes-de-Haute-Provence" ,"04"],
        ["Hautes-Alpes" ,"05"],
        ["Alpes-Maritimes" ,"06"],
        ["Ardèche" ,"07"],
        ["Ardennes" ,"08"],
        ["Ariège" ,"09"],
        ["Aube" ,"10"],
        ["Aude" ,"11"],
        ["Aveyron" ,"12"],
        ["Bouches-du-Rhône" ,"13"],
        ["Calvados" ,"14"],
        ["Cantal" ,"15"],
        ["Charente" ,"16"],
        ["Charente-Maritime" ,"17"],
        ["Cher" ,"18"],
        ["Corrèze" ,"19"],
        ["Côte-d'Or" ,"21"],
        ["Côtes-d'Armor" ,"22"],
        ["Creuse" ,"23"],
        ["Dordogne" ,"24"],
        ["Doubs" ,"25"],
        ["Drôme" ,"26"],
        ["Eure" ,"27"],
        ["Eure-et-Loir" ,"28"],
        ["Finistère" ,"29"],
        ["Corse-du-Sud" ,"2A"],
        ["Haute-Corse" ,"2B"],
        ["Gard" ,"30"],
        ["Haute-Garonne" ,"31"],
        ["Gers" ,"32"],
        ["Gironde" ,"33"],
        ["Hérault" ,"34"],
        ["Ille-et-Vilaine" ,"35"],
        ["Indre" ,"36"],
        ["Indre-et-Loire" ,"37"],
        ["Isère" ,"38"],
        ["Jura" ,"39"],
        ["Landes" ,"40"],
        ["Loir-et-Cher" ,"41"],
        ["Loire" ,"42"],
        ["Haute-Loire" ,"43"],
        ["Loire-Atlantique" ,"44"],
        ["Loiret" ,"45"],
        ["Lot" ,"46"],
        ["Lot-et-Garonne" ,"47"],
        ["Lozère" ,"48"],
        ["Maine-et-Loire" ,"49"],
        ["Manche" ,"50"],
        ["Marne" ,"51"],
        ["Haute-Marne" ,"52"],
        ["Mayenne" ,"53"],
        ["Meurthe-et-Moselle" ,"54"],
        ["Meuse" ,"55"],
        ["Morbihan" ,"56"],
        ["Moselle" ,"57"],
        ["Nièvre" ,"58"],
        ["Nord" ,"59"],
        ["Oise" ,"60"],
        ["Orne" ,"61"],
        ["Pas-de-Calais" ,"62"],
        ["Puy-de-Dôme" ,"63"],
        ["Pyrénées-Atlantiques" ,"64"],
        ["Hautes-Pyrénées" ,"65"],
        ["Pyrénées-Orientales" ,"66"],
        ["Bas-Rhin" ,"67"],
        ["Haut-Rhin" ,"68"],
        ["Rhône" ,"69"],
        ["Haute-Saône" ,"70"],
        ["Saône-et-Loire" ,"71"],
        ["Sarthe" ,"72"],
        ["Savoie" ,"73"],
        ["Haute-Savoie" ,"74"],
        ["Paris" ,"75"],
        ["Seine-Maritime" ,"76"],
        ["Seine-et-Marne" ,"77"],
        ["Yvelines" ,"78"],
        ["Deux-Sèvres" ,"79"],
        ["Somme" ,"80"],
        ["Tarn" ,"81"],
        ["Tarn-et-Garonne" ,"82"],
        ["Var" ,"83"],
        ["Vaucluse" ,"84"],
        ["Vendée" ,"85"],
        ["Vienne" ,"86"],
        ["Haute-Vienne" ,"87"],
        ["Vosges" ,"88"],
        ["Yonne" ,"89"],
        ["Territoire de Belfort" ,"90"],
        ["Essonne" ,"91"],
        ["Hauts-de-Seine" ,"92"],
        ["Seine-Saint-Denis" ,"93"],
        ["Val-de-Marne" ,"94"],
        ["Val-d'Oise" ,"95"],
        ["Guadeloupe" ,"971"],
        ["Martinique" ,"972"],
        ["Guyane" ,"973"],
        ["La Réunion" ,"974"],
    ]
)

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

/////////// Async example///////////
//async function parallel(arr, fn, threads = 2) {
//  const result = [];
//  while (arr.length) {
//    const res = await Promise.all(arr.splice(0, threads).map(x => fn(x)));
//    result.push(res);
//  }
//  return result.flat();
//}
//------------------
//const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
//const apiLikeFunction = v =>
//    new Promise((resolve, rej) =>
//      setTimeout(() => {
//        console.log('executing : ', v);
//        resolve(v * v);
//      }, 3000),
//    )
//const threads = 5
//const res = await parallel(arr,apiLikeFunction, 5);
/////////////////////////////////
