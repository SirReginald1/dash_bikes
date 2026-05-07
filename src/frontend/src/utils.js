//TODO: add error conditions to help debugging
//TODO: Optimize groupDataIdx function
//TODO: Optimise The use of sets for idxSubsets

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
