# !!!!!!!!! in json files convert to is the final step in the process 
# All data processing is applied to load_as data type !!!!!!!!!!!!!!!

# TODO: Make automatic formatting work with types other than str
# TODO: Make it so that when running automatic formatting the function returns
# TODO: Specify raise conditions in doc strings
# a list of all errors so that they can all be corrected at once
# TODO: Add function to check validity of info.json files
# TODO: Flatten all datasets on loading. Make composite name of parent and
# child datasets as key.
# TODO: Add ability to insert data into datasets via api calls instead of
# downloading the full dataset.


from typing import Union, Callable, Any
import json
import warnings
import simplejson as simj
import sys
import os
from pathlib import Path
from polars.expr.expr import Expr
import polars as pl
from data_keys import (
    ROOT_DATA_PATH,
    DATA_DICT,
    BIKE_ACCIDENTS_DATA_KEY,
    POPULATION_DOWNLOAD_KEY,
    validate_dataset_key,
    filter_valide_dataset_keys
)


TYPE_EQUIVALENCE_DICT = {
    "int": pl.Int64,
    "int64": pl.Int64,
    "int32": pl.Int32,
    "int16": pl.Int16,
    "int8": pl.Int8,
    "float": pl.Float64,
    "float64": pl.Float64,
    "float32": pl.Float32,
    "float16": pl.Float16,
    "str": pl.String,
}

# TODO: Make one for each for each conversion type
REQUIRED_MERGING_INFO_KEYS = set([
    "match_current_data_key",
    "match_other_data_key",
    "insert_data_to",
    "vars"
])


VALID_MERGING_INFO_KEYS = set([]).update(REQUIRED_MERGING_INFO_KEYS)

# Have dataset key as values and dicts with variable column name as key
# and datapoint formating function as value
CUSTOM_FORMATTING_FUNCTIONS = {

}


def load_metadata_dict(data_key_lists: list[str],
                       metadata_path_dict: dict[str, Any],
                       root_data_path: str) -> dict[str, dict[str, Any]]:
    """Loads metadata dictionaries for the provided data key in data_key_lists.
    
    Args:
        - data_key_lists (list[str]): List of dataset keys of dataset info to
            load.
        - metadata_path_dict (dict[str, Any]): The dictionary with dataset key
            as key and dict of path and sub dataset keys as values.
        - root_data_path (str): The path to the root folder where all the
            datasets are stored.
    Returns:
        - dict[str, dict[str, Any]]: Dictionary with dataset key as key and
            metadata dictionary as value.
    """

    out = {}
    for key in data_key_lists:
        if not validate_dataset_key(key):
            continue
        with open(root_data_path / metadata_path_dict[key]["info_data_path"],
                  "r",
                  encoding="utf-8") as file:
                out[key] = json.load(file)
                file.close()
    return out


def validate_var_info_file(var_info_dict: dict[str: dict[str, Any]]
                           ) -> dict[str, Any]:
    """Checks to see if the info file is valide. If there are any mistakes
    will return dict listing all the problems for each section.
    """
    raise NotImplementedError()


def build_data_schema(var_info_dict: dict[str, Any]) -> pl.Schema:
    """For a given variable info dictionary will produce the appropriate
    data schema for loading data.

    Args:
        - var_info_dict (dict[str, Any]): The dictionary containing the info
            for all the variables.

    Returns:
        - pl.Schema: The data schema for the data being loaded.
    """

    out = {}
    for key in var_info_dict:
        out[key] = TYPE_EQUIVALENCE_DICT[var_info_dict[key]["load_as"]]
    return pl.Schema(out)


def build_cast_to_list(var_info: dict[str, dict[str, Any]]) -> list[Expr]:
    """Takes the variable info dict and constructs a list of polar expression
    to be used to cast variables to there output type.

    Args:
        - var_info (dict[str, dict[str, Any]]): The part of the dataset info
            dictionary that contains all the information for each of the
            variables in the dataset.
    
    Returns:
        - list[Expr]: List of polars expressions used to cast datasets to new
            types.
    """
    out = []
    for var in var_info:
        if var_info[var]["load_as"] != var_info[var]["convert_to"]:
            out.append(
                pl.col(var).cast(
                    TYPE_EQUIVALENCE_DICT[var_info[var]["convert_to"]]
                )
            )
    return out


# TODO: Add automatic aberrent value detection and formatting option (if int then)
def format_function_factory(variable: str,
                            null_replace_val: Union[str, None],
                            replace_with_null: Union[Any, list[Any], None],
                            chars_to_remove: Union[str, list[str], None],
                            replace_chars_dict: Union[dict[str, str], None],
                            ) -> Callable:
    """Creates the function to be applied to each cell of a column.
    
    Args:
        - variable (str): The column name of the column to be formatted.
        - null_replace_val (Union[str, None]): The value to replace
            None/null/NaN values. Use None to keep values as None.
        - replace_with_null (Union[Any, list[Any], None]): The element or
            list of elements to be replaced with None value.
        - chars_to_remove (Union[str, list[str], None]): The character or
            list of characters to remove. 
        - replace_chars_dict (Union[dict[str, str], None]): A dictionary
            of key value paires of characters or substrings to be replaced.
    
    Return:
        - Callable: The function to be applied to each cell in the specified
            variable column.
    """

    def output(element: Union[Any, None]) -> Union[Any, None]:
        """The function to be applied to each cell of a column.
        
        Args:
            - element (Union[str, None]): The element from a column that
                will be formatted.

        Returns:
            - Union[str, None]: The formatted element.
        """
        # Check if input is None
        if element is None:
            if isinstance(null_replace_val, str):
                return null_replace_val.strip()
            else:
                return null_replace_val
        # Check if element should be replaced by None
        if isinstance(replace_with_null, list) and element in replace_with_null:
            return None
        if replace_with_null == element:
            return None
        out = element
        # First remove invalide character
        if chars_to_remove is None:
            pass
        elif isinstance(chars_to_remove, list):
            for rem_char in chars_to_remove:
               out = out.replace(rem_char, "")
        elif isinstance(chars_to_remove, str):
            out = out.replace(chars_to_remove, "")
        else:
            raise ValueError(
                f"The provided remove_chars value for variable {variable} is "
                f"of type {type(chars_to_remove)} it must be of type str or"
                " None."
            )
        # If replace character key not in var key dict
        if replace_chars_dict is not None and not isinstance(
            replace_chars_dict,
            dict
        ):
            raise ValueError(
                f"The provided replace_chars value for variable {variable} "
                f"must be a dictionary. Is of type: {type(replace_chars_dict)}"
            )
        if replace_chars_dict is not None:
            for replace_char_key in replace_chars_dict:
                out = out.replace(replace_char_key,
                                  replace_chars_dict[replace_char_key])
        if isinstance(out, str):
            out = out.strip()
        return out
    return output


def split_formatting_function_factory(formatting_function: Callable,
                                      split_char: str) -> Callable:
    """Creates the function to be applied to variables that have a split
    character.
    
    Args:
        - formatting_function (Callable): The formatting function to be
            applied to each split elements individually.
        - split_char (str): The character used to split the data.
    
    Returns:
        - Callable: The function to be applied to each element for a
            variable with a split character.
    """

    def output(element: Union[str, None]) -> Callable:
        """The function to be applied to each cell of a column.
        
        Args:
            - element (Union[str, None]): The element from a column that
                will be formatted.

        Returns:
            - Union[str, None]: The formatted element.
        """

        if element is None:
            return formatting_function(element)
        split_array = element.split(split_char)
        for idx, split_element in enumerate(split_array):
            split_array[idx] = formatting_function(split_element)
        return split_char.join(split_array)
    return output


def inset_geojson_properties_data(geojson: dict[str, Any],
                                  insert_data: dict[str, Any]
                                  ) -> None:
    """Inserts the provided data into the properties section of each element
    of the provided geojson.
    
    Args:
        - geojson (dict[str, Any]): Geojson data.
        - insert_data (dict[str, Any]): Dictionary containing the data
            to be inserted into the properties section of each geojson element.
    """
    for element in geojson["features"]:
        for insert_key in insert_data:
            element["properties"][insert_key] = insert_data[insert_key]


def format_geojson(geojson: dict[str, Any],
                   geojson_formatting_metadata: dict[str, Any],
                   data_to_insert: dict[str, pl.DataFrame] = None,) -> None:
    """Formats the provided geojson data based on the provided formatting
    metadata.

    Args:
        - geojson (dict[str, Any]): The geojson data to format.
        - data_to_insert (dict[str, pl.DataFrame]): Dictionary of polars data
            frames containing the data to insert into the geojson data.
        - geojson_formatting_metadata (dict[str, Any]): The section of the geojson
            metadata that contains the information on dataset formatting. This
            metadata also includes information on extra data to insert into the
            geojson metadata and where to find the inserted data.
    """
    # TODO: Implement geojson formatting
    # TODO: Check to see if new names have been defined if not use originals
    insert_data_dict = {}
    inset_geojson_properties_data(geojson, insert_data_dict)


def format_data_default(data: pl.DataFrame,
                        var_key_dict: dict[str, dict[str, str]],
                        var_to_exclude: list[str] = None,
                        custom_var_functions: dict[str: Callable] = None
                        ) -> pl.DataFrame:
    """The generic data formatting function.
    
    Args:
        - data (pl.DataFrame): Raw bike accident data.
        - var_key_dict (dict[str, dict[str, str]]): Dictionary variable as
            kay as dict of var value replacements.

    Returns:
        - pl.DataFrame: The formatted bike accident data.
    """

    # Remove unwanted variables
    if var_to_exclude is not None:
        data = data.drop(var_to_exclude)
    for var in var_key_dict:
        # Check if custom formatting function exists
        if custom_var_functions is not None:
            custom_format_function = custom_var_functions.get(var)
        if custom_var_functions is not None:
            data = data.with_columns(
                pl.col(var).map_elements(custom_format_function)
            )
        # Default formatting
        else:
            formatting_function = format_function_factory(
                variable=var,
                null_replace_val=var_key_dict[var].get("null_replace_val"),
                replace_with_null=var_key_dict[var].get("replace_with_null"),
                chars_to_remove=var_key_dict[var].get("remove_chars"),
                replace_chars_dict=var_key_dict[var].get("replace_chars")
            )
            # Check that elements don't need a split
            split_char = var_key_dict[var].get("split_char")
            if split_char is not None:
                split_formatting_function = split_formatting_function_factory(
                    formatting_function,
                    split_char
                )
                data = data.with_columns(
                    pl.col(var).map_elements(split_formatting_function)
                )
            else:
                data = data.with_columns(
                    pl.col(var).map_elements(
                        formatting_function,
                        return_dtype=TYPE_EQUIVALENCE_DICT.get(
                            var_key_dict[var]["load_as"]
                        )
                    )
                )
            # Cast data to final data type
            data = data.with_columns(
                pl.col(var).cast(
                    TYPE_EQUIVALENCE_DICT.get(var_key_dict[var]["convert_to"])
                )
            )
    return data


# Functions should take datasets or lists of datasets
FORMATTING_FUNCTIONS = {
    BIKE_ACCIDENTS_DATA_KEY: format_data_default,
    POPULATION_DOWNLOAD_KEY: format_data_default,
}


# Dataset keys are the names of the combined datasets
#MERGING_FUNCTIONS = {
#
#}

# TODO: Move data info dict out 1 layer
# TODO: Split load single dataset and load all datasets
def load_dataset(dataset_keys: list[str],
                 data_metadata_dict: dict[str, Any],
                 root_data_path: Path
                 ) -> dict[str, Union[pl.DataFrame, dict[str, pl.DataFrame]]]:
    """Loads all the specified datasets using there specified schemes.
    
    Args:
        - dataset_keys (list[str]): A list of keys that reference the
            datasets to load.
        - data_metadata_dict (dict[str, Any]): The dictionary containing the
            the datasets metadata.
        - root_data_path (Path): The path to the directory containing all
            the data for the application.

    Returns:
        - dict[str, Union[pl.DataFrame, dict[str, pl.DataFrame]]]: Dictionary
            with data keys as keys and polars data frames as velues.
    """

    out = {}
    for data_key in dataset_keys:
        separator = data_metadata_dict[data_key]["data_info"].get("separator")
        if separator == None:
            separator = ","
        # Skip key if key is not valid
        if not validate_dataset_key(data_key):
            continue
        sub_dir_data_path = root_data_path /\
                data_metadata_dict[data_key]["data_info"]["sub_data_dir"]
        # If the formatting requiers multiple files
        local_file_name =\
            data_metadata_dict[data_key]["data_info"]["local_file_name"]
        # If t
        if isinstance(local_file_name,
                      list):
            sub_data_dict = {}
            for idx, dataset_file_name in enumerate(local_file_name):
                # If the file is of json type
                if dataset_file_name.split(".")[-1].find("json") > -1:
                    with open(
                        sub_dir_data_path / local_file_name,
                        'r'
                    ) as file:
                        sub_data_dict[
                            data_metadata_dict[
                                data_key
                            ]["data_info"]["sub_data_keys"][idx]
                        ] = json.load(file)
                # TODO: Deale with multiple schemas using a single key !!!!!!!!
                # Check to see if a a data schema exits for this dataset
                elif data_metadata_dict[data_key].get("var_info") is not None:
                    sub_data_dict[
                        data_metadata_dict[
                            data_key
                        ]["data_info"]["sub_data_keys"][idx]
                    ] = pl.read_csv(
                        sub_dir_data_path / dataset_file_name,
                        try_parse_dates=True,
                        separator=separator,
                        schema_overrides=build_data_schema(
                            data_metadata_dict[data_key]["var_info"]
                        )
                    )
                else:
                    sub_data_dict[dataset_file_name] = pl.read_csv(
                       sub_dir_data_path / dataset_file_name,
                       try_parse_dates=True,
                       separator=separator
                    )
            out[data_key] = sub_data_dict
        # If files require a single file
        elif isinstance(local_file_name, str):
            # If the file is of json type
            if local_file_name.split(".")[-1].find("json") > -1:
                with open(sub_dir_data_path / local_file_name, 'r') as file:
                    out[data_key] = json.load(file)
            elif data_metadata_dict[data_key].get("var_info") is not None:
                out[data_key] = pl.read_csv(
                        sub_dir_data_path / local_file_name,
                        try_parse_dates=True,
                        schema_overrides=build_data_schema(
                            data_metadata_dict[data_key]["var_info"]
                        )
                    )
            else:
                out[data_key] = pl.read_csv(
                     sub_dir_data_path / local_file_name,
                    try_parse_dates=True
                )
        # Yes this is overkill
        else:
            raise ValueError(
                f"local_file_name {data_metadata_dict[data_key]["data_info"][
                    "local_file_name"
                ]}"
                f" for dataset {data_key} is not a string or a list."
            )
    return out


def format_data(data_dict: dict[str, Union[pl.DataFrame,
                                           dict[str, pl.DataFrame]]],
                formatting_functions: dict[str, Union[Callable,
                                                      dict[str, Callable]]],
                metadata_dict: dict[str, Union[str, str]]
                ) -> dict[str, Union[pl.DataFrame,
                                     dict[str, pl.DataFrame]]]:
    """Formats all datasets present in the provided data dict individually.
    
    Args:
        - data_dict (dict[str, Union[pl.DataFrame, dict[str, pl.DataFrame]]]):
            A dictionary containing all the data to be formatted in the form of
            polars data frames. Uses data keys as keys and file names as
            sub data keys.
        - formatting_functions (dict[str, function]): A dictionary with data
            keys as key and formatting function or dictionary of formatting
            functions as values.
        - metadata_dict (dict[str, Union[str, str]]): Dictionary with data
            key as key and variables values dictionaries as values.

    Returns:
        - dict[str, Union[pl.DataFrame, dict[str, pl.DataFrame]]]:
            Copy of dictionary with same structure as inputted dictionary but
            with formatted data.
    """

    out = {}
    for data_dict_key in data_dict:
        format_fun_dict = CUSTOM_FORMATTING_FUNCTIONS.get(data_dict_key)
        # If the data contains sub data files
        if isinstance(data_dict[data_dict_key], dict):
            sub_data_dict = {}
            for sub_data_dict_key in data_dict[data_dict_key]:
                sub_data_dict[sub_data_dict_key] =\
                    formatting_functions[data_dict_key][sub_data_dict_key](
                        data_dict[data_dict_key][sub_data_dict_key].clone(),
                        metadata_dict[data_dict_key]["var_info"],
                        var_to_exclude=metadata_dict[data_dict_key][
                            "data_info"
                        ].get("excluded_variables"),
                        custom_var_functions=format_fun_dict
                    )
            out[data_dict_key] = sub_data_dict
        else:
            out[data_dict_key] = formatting_functions[data_dict_key](
                data_dict[data_dict_key].clone(),
                metadata_dict[data_dict_key]["var_info"],
                var_to_exclude=metadata_dict[data_dict_key][
                    "data_info"
                ].get("excluded_variables"),
                custom_var_functions=format_fun_dict
            )
    return out


def merge_dataset(data_dict: dict[str, Union[pl.DataFrame,
                                             dict[str, pl.DataFrame]]],
                  formatting_functions: dict[str, Union[Callable,
                                                        dict[str, Callable]]]
                  ) -> dict[str, Union[pl.DataFrame,
                                       dict[str, pl.DataFrame]]]:
    """Function called to build datasets that are composed of multiple original
    datasets.
    """

    raise NotImplementedError()


def extract_nested_val(nested_dict: dict[str, dict[str, Any]],
                       dict_path: list[str]) -> Any:
    """Given dictionary of nested dictionaries and a list of keys will
    run through the keys in order and extract the value at the end of the key
    list.
    
    Args:
        - nested_dict (dict[str, dict[str, Any]]): The dictionary that contains
            the value to extract.
        - dict_path (list[str]): The list of keys in order of access.
    Returns:
        - The value at the end of the key list.
    """
    out = nested_dict
    for key in dict_path:
        out = out[key]
    return out

def insert_val_nested_dict(nested_dict: dict[str, dict[str, Any]],
                           dict_path: list[str],
                           value: Any,
                           label: str) -> None:
    """Given dictionary of nested dictionaries and a list of keys will
    run through the keys in order and place the provided value under the key
    name of the last key provided in `dict_path`.
    
    Args:
        - nested_dict (dict[str, dict[str, Any]]): The dictionary in which to
            place the provided value.
        - dict_path (list[str]): The list of keys in order of access. The last
            key in the list will be the one under which the provided value will
            be placed. The last key does not need to already exist in
            `nested_dict`.
        - value (Any): The value to be placed at end of the provided key list.
        - label (str): The label under which the value will be placed.
    """
    position = nested_dict
    for path_key in dict_path:
        position = position.get(path_key)
    position[label] = value

def build_reference_dict(data_array: list[Any],
                         dict_path: list[str] = None
                         ) -> dict[Any, int]:
    """Builds a reference dictionary the links `data_array` values to there
    index in the array. Used to speed up searches.
    
    Args:
        - data_array (list[Any]): Lits of values to create the reference
            dictionary for.
        - dict_path (Optional, list[str]): If elements in `data_array` are
            nested dictionaries the `dict_path` provides the path to the value
            in the nested dictionaries to be used as dictionary key in the
            output.
    
    Returns:
        - dict[Any, int]: Dictionary containing the values to be matched as
            keys and the index of those keys in the the original `data_array`
            list.
    """
    out = {}
    if not dict_path:
        for idx, value in enumerate(data_array):
            out[value] = idx
        return out
    for idx, value in enumerate(data_array):
        out[extract_nested_val(value, dict_path)] = idx
    return out


# TODO: Finish adding all necessary checks for a valid geojson
def validate_geojson(geojson: dict[str, dict[str, Any]]) -> None:
    """"""
    # Check that it has a type
    if geojson.get('type') is None:
        raise ValueError("The base data is not valid geojson format it does "
                         "not have a type.")
    # Check that the data is the correct type of geojson
    if geojson.get('type') != 'FeatureCollection':
        raise ValueError("Only geojson files of type FeatureCollection "
                         "are supported. This file is of type "
                         f'"{geojson.get('type')}".')


# TODO: Finish adding all necessary checks for a valid merge info dict
# TODO: Fit all validation function into a DatasetInfo class
def validate_merge_info(merge_info: dict[str, Any],
                        validation_type: str = None) -> None:
    """Checks that the merging data is of valide format for the type of
    merging.

    Args:
        - merge_info (dict[str, Any]): The dictionary that contains all the
            data relative to merging datasets.
        - validation_type: (Optional, str): The 
    """
    if validation_type is None:
        # Check that all required key are present
        missing_keys = []
        for key in REQUIRED_MERGING_INFO_KEYS:
            if merge_info.get(key) is None:
                missing_keys.append(key)
        if len(missing_keys) > 0:
            raise ValueError("The following merging dictionary keys are missing or"
                             f"are incorrectly spelled: {missing_keys}.\n"
                             f"Required keys are: {REQUIRED_MERGING_INFO_KEYS}")
        # Check that all keys are valid keys
        invalid_keys = []
        for key in merge_info.keys():
            if key not in VALID_MERGING_INFO_KEYS:
                invalid_keys.append(key)
        if len(invalid_keys) > 0:
            raise ValueError("Merge info dict has the following invalid keys: "
                             f"{key}.\n"
                             "List of valide keys are:\n"
                             f"{VALID_MERGING_INFO_KEYS}")
    else:
        NotImplementedError("Validation type not implemented yet.")


def merge_data_into_geojson(base_data: dict[str, dict[str, Any]],
                            merging_data: Union[dict[str, dict[str, Any]],
                                                pl.DataFrame],
                            merg_data_info: dict[str, dict[str, Any]]
                            ) -> None:
    """Merges the provided `merging_data` into the provided `base_data` geojson
    dataset using the information provided in `merg_data_info`. The merging
    data must be a data frame or data frame formatted to dictionary.
    
    Args:
        - base_data (dict): The geojson dataset that data from the
            `merging_data` parameter will be merged into.
        - merging_data (dict | pl.DataFrame): The dataset containing the data
            to be merged into the `base_data`.
        - merg_data_info: (dict): The dictionary containing the information
            about the dataset merging.
        """
    # TODO: Move this up the function call chain
    # try:
    #     validate_geojson(base_data)
    # except ValueError as e:
    #     print("The base data is not a valide or supported geojson format.")
    #     print(e)
    ref_dict = build_reference_dict(
        base_data['features'],
        merg_data_info["match_current_data_key"]
    )
    # Run through all variables to merge in this dataset
    for other_idx, other_match_value in enumerate(merging_data[merg_data_info[
        "match_other_data_key"
    ]]):        
        for var_to_merge in merg_data_info['vars']:
            # Extract the data from for the selected var at the idx of
            # other_match_value
            value_to_insert = merging_data[var_to_merge['var']][other_idx]
            base_match_idx = ref_dict.get(other_match_value)
            # Attempt to do type matching
            if base_match_idx is None:
                base_match_idx = ref_dict.get(str(other_match_value))
            if base_match_idx is None:
                base_match_idx = ref_dict.get(int(other_match_value))
            if base_match_idx is None:
                base_match_idx = ref_dict.get(float(other_match_value))
            # Raise warning and continue if no equivalent is found
            if base_match_idx is None:
                warnings.warn(
                    "The following {"
                    f"value: {other_match_value}, var base: "
                    f"{var_to_merge['var']} "
                    "} had no match in the base dataset."
                )
                continue
            insert_val_nested_dict(
                base_data["features"][base_match_idx],
                merg_data_info["insert_data_to"],
                value_to_insert,
                var_to_merge['new_var_name']
            )


def check_same_keys(dict1: dict[str, Any],
                    dict2: dict[str, Any],
                    both: bool = False) -> None:
    """Checks all keys in dictionary 2 must have all the keys present in
    dictionary 1. If `both` flag is true both dictionaries must have the
    exactly the same keys.
    
    Args:
        - dict1 (dict[str, Any]): The first dictionary to check.
        - dict2 (dict[str, Any]): The second dictionary to check.
        - both (bool): If true both dictionary must have the exact the same
            keys. Else `dict2` must have all the keys present in `dict1` to
            pass the check.
    Raises:
        - ValueError: If there is any difference in the keys between both
            dictionaries.
    """
    message = ""
    unique_dict1_keys = []
    for key in dict1:
        if dict2.get(key) is None:
            unique_dict1_keys.append(key)
    unique_dict2_keys = []
    if both:
        for key in dict2:
            if dict1.get(key) is None:
                unique_dict2_keys.append(key)
    if len(unique_dict1_keys) > 0 or len(unique_dict2_keys) > 0:
        message = ""
        if len(unique_dict1_keys) > 0:
            message += "Dictionary 1 has the following keys that are not "\
                        f"present in dictionary 2: {unique_dict1_keys}\n"
        if len(unique_dict2_keys) > 0:
            message += "Dictionary 2 has the following keys that are not "\
                        f"present in dictionary 1: {unique_dict2_keys}"
        raise ValueError(message)


def merge_data(base_data: Union[dict[str, list[Any]],
                                pl.DataFrame,
                                dict[str, dict[str, Any]]],
               merging_data: dict[str, Union[dict[str, list[Any]],
                                             pl.DataFrame,
                                             dict[str, dict[str, Any]]]],
               merg_data_info: dict[str, dict[str, Any]]
               ) -> Union[dict[str, list[Any]],
                          pl.DataFrame,
                          dict[str, dict[str, Any]]]:
    """Merges all the relevant data in the provided `merging_data` parameter
    into the provided single `base_data` dataset. Using the information
    provided in associated `merg_data_info` parameter.
    
    Args:
        - base_data (dict | pl.DataFrame): The dataset that data from
            the `merging_data` parameter will be merged into.
        - merging_data (dict[str, Any]): Dictionary of datasets from which the
            data to be merged will be taken. The dictionary most contain all
            the keys that are present in the first level of the
            `merg_data_info` parameter.
        - merg_data_info (dict[str, Any]): The dictionary containing all the
            the information on how to merge data into the associated
            `base_data` dataset.
    Raises:
        - ValueError: If `merg_data_info` parameter contains keys that are not
            present in the `merging_data` parameter.
        - ValueError: If the `base_data` parameter is not of type dict or
            pl.DataFrame.
    """
    # Making sure merging_data and merg_data_info have all the same keys
    # before doing any merging
    # Check at first level
    try:
        check_same_keys(merg_data_info, merging_data)
    except ValueError as e:
        raise ValueError(
            "Error while merging datasets. Dataset dictionary and merging "
            f"info have a mismatch in keys.\n{e}"
        )
    if isinstance(base_data, pl.DataFrame):
        raise NotImplementedError("Use of polars data frames not implemented"
                                  " yet.")
    # Base data is in dict format
    if isinstance(base_data, dict):
        # Base data is a geojson
        if base_data.get('type') == 'FeatureCollection':
            for merging_data_key in merg_data_info:
                # If there are sub datasets
                # TODO: Remove this when datasets have been flattened
                if merging_data[merging_data_key].get("match_other_data_key")\
                    is None:
                    try:
                        check_same_keys(
                            merg_data_info[merging_data_key],
                            merging_data[merging_data_key]
                        )
                    except ValueError as e:
                        print("Error while merging nested datasets in "
                              f"{merging_data_key} parent dataset. "
                              "Dataset dictionary and merging info have a "
                              f"mismatch in keys.\n{e}")
                    for sub_merging_data_key in merg_data_info[merging_data_key]:
                        merge_data_into_geojson(
                            base_data,
                            merging_data[merging_data_key][
                                sub_merging_data_key
                            ],
                            merg_data_info[merging_data_key][
                                sub_merging_data_key
                            ]
                        )
                # If there are no nested datasets
                else:
                    merge_data_into_geojson(
                        base_data,
                        merging_data[merging_data_key],
                        merg_data_info[merging_data_key]
                    )
        # Dict formatted data frame.
        else:
            raise NotImplementedError("Only FeatureCollection geojson format"
                                      " is currently supported.")
    else:
        raise ValueError(f"The base data of type {type(base_data)} is not"
                         "supported")


def merge_all_datasets(merging_data: dict[str, Union[dict[str, list[Any]],
                                                     pl.DataFrame,
                                                     dict[str,
                                                          dict[str, Any]]]],
                       dataset_info: dict[str, dict[str, Any]]) -> None:
    """Runs through all the `dataset_info` keys and performs a merge if the
    dataset info has the "merging_data" key according to the info found it
    contains.
    
    Args:
        - merging_data (dict): Dictionary containing all datasets used in the
            merge.
        - dataset_info (dict): Dictionary containing the dataset info
            section of each dataset that will have data merged into it.
    """
    for merge_info_key in dataset_info:
        if dataset_info[merge_info_key].get("merging_data"):
            merge_data(
                merging_data[merge_info_key],
                merging_data,
                dataset_info[merge_info_key]["merging_data"]
            )


def build_frontend_metadata_dict(metadata_dicts: dict[str, dict[str, Any]]
                                 ) -> dict[str, dict[str, Any]]:
    """"""

    out = {}
    for dataset_key in metadata_dicts:
        data_info = metadata_dicts[dataset_key]["data_info"]
        var_info =  metadata_dicts[dataset_key]["var_info"].copy()
        # Check to see if vars to include or exclude are specified
        exclude_keys = data_info.get("load_var_info_keys_exclude")
        if exclude_keys is not None:
            out[dataset_key] = {}
            for var_key in var_info:
                out[dataset_key][var_key] = {}
                for metadata_key in metadata_dicts[dataset_key]["var_info"][
                    var_key
                ]:
                    if metadata_key not in exclude_keys:
                        ##print(f"value pop: {var_info[var_key].pop(metadata_key)}")
                        out[dataset_key][var_key][metadata_key] = var_info[
                            var_key
                        ][metadata_key]
        elif data_info.get("load_var_info_keys_include"):
            include_keys = data_info.get("load_var_info_keys_include")
            if include_keys is not None:
                print("Include")
                var_data = {}
                for var_key in var_info:
                    var_data[var_key] = {}
                    for metadata_key in metadata_dicts[dataset_key][
                        "var_info"
                    ]:
                        if metadata_key in include_keys:
                            var_data[var_key][metadata_key] = var_info[
                                var_key
                            ][metadata_key]
                out[dataset_key] = var_data
        else:
            out[dataset_key] = var_info
    return out


def convert_polars_to_json(data_set: pl.DataFrame
                           ) -> dict[str, list[Union[str, int, float]]]:
    """Converts polars data into valid json dictionary format.

    Args:
        - data_set (pl.DataFrame): The data to convert to json format.

    Returns:
        - dict[str, list[Union[str, int, float]]]: Data in json format.
    """

    out_dict = data_set.to_dict()
    for col_name in out_dict:
        listed_col = list(out_dict[col_name])
        if isinstance(out_dict[col_name][0], (str, int, float)):
            out_dict[col_name] = listed_col
        else:
            temp_col = []
            for entry in listed_col:
                temp_col.append(str(entry))
            out_dict[col_name] = temp_col
    return out_dict


def convert_datasets_to_json(datasets: dict[str, pl.DataFrame]
                             ) -> dict[str, dict[str, list[Any]]]:
    """"""
    out = {}
    for dataset_key in datasets:
        out[dataset_key] = convert_polars_to_json(datasets[dataset_key])
    return out


def _rec_dict_search(dict: dict[str, Any],
                     key: str) -> Union[None, Any]:
    """Searches recursively through the provided dict for the provided key.
    
    Args:
        - dict (dict[str, Any]): Dictionary to search through.
        - key (str): The key to search for.

    Returns:
        - Union[None, Any]: The value to the 
    """

    raise NotImplementedError()


def merge_metadata(data_set: dict[str, list[Union[str, int, float]]],
                   meta_data: dict[str, Any],
                   vars_to_extract: dict[str, list[Any]]) -> dict[str, Any]:
    """Extracts metadata to be sent co client and merges it with the full
    dataset.

    Args:
        - data_set (dict[str, list[Union[str, int, float]]]): The data in
            json format.
        - mata_data (dict[str, Any]): All data info.
        - vars_to_extract (dict[str, list[Any]]): Dictionary of nested
            dictionaries containing all the keys and list of keys of metadata
            to include.
    
    Returns:
        - dict[str, Any]: All data to be set to client.
    """

    out = {}
    out["data"] = data_set
    # Extract list of stated values from metadata
    out["data_info"] = {}
    for key in vars_to_extract["data_info"]:
        value = meta_data.get(key)
        if value is not None:
            out["data_info"][key] = meta_data[key]
    # Iterate all variables and extract stated values for each variable
    if meta_data.get("var_info"):
        out["var_info"] = {}
        for var in meta_data["var_info"]:
            out["var_info"][var] = {}
            for extract_key in  vars_to_extract["var_info"]:
                value = meta_data["var_info"][var].get(extract_key)
                if value is not None:
                    out["var_info"][var][extract_key] = value
    return out


def save_to_json_data(data_dict: dict[str, list[Any]],
                      saving_file_path: str) -> None:
    """Save the provided data dict in json format to the specified path.
    
    Args:
        - data_dict (dict[str, list[Any]]): The data to save.
        - saving_file_path (str): The path to save the data to.
    """

    with open(saving_file_path, "w", encoding="utf-8") as file:
        #json.dump()
        #json.dump(data_dict,
        #          file,
        #          indent=10,
        #          allow_nan=False,
        #          ign)
        simj.dump(data_dict,
                  file,
                  indent=10,
                  ignore_nan=True,
                  ensure_ascii=False)
        file.close()


def save_datasets_as_json(json_datasets_dict: dict[str, dict[str, list[Any]]],
                          metadata_dict: dict[str, dict[str, Any]],
                          root_data_path: str) -> None:
    """"""

    for dataset_key in json_datasets_dict:
        save_to_json_data(
            json_datasets_dict[dataset_key],
            root_data_path /\
                metadata_dict[dataset_key]["data_info"]["formated_file_name"]
        )
        print(
            f"json saved to path: {root_data_path /\
                metadata_dict[dataset_key]["data_info"]["formated_file_name"]}"
        )


# TODO: Add ability to select certain large datasets to be loaded individually
if __name__ == "__main__":
    # load metadata dict
    # If no arguments passed to script fetch all
    if len(sys.argv) == 1:
        dataset_keys = list(DATA_DICT.keys())
    else:
        dataset_keys = filter_valide_dataset_keys(sys.argv[1:])
    # print(f"sys args: {sys.argv}")
    # print(f"dataset keys: {dataset_keys}")
    # Load metadata dict
    metadata_dict = load_metadata_dict(dataset_keys,
                                       DATA_DICT,
                                       ROOT_DATA_PATH)
    # print(f"metadata keys: {metadata_dict}")
    # Load datasets
    datasets = load_dataset(dataset_keys,
                            metadata_dict,
                            ROOT_DATA_PATH)
    # Format datasets
    datasets = format_data(datasets,
                           FORMATTING_FUNCTIONS,
                           metadata_dict)
    # Merge datasets
    merge_all_datasets(datasets, metadata_dict)
    # Save formatted json data
    for dataset_key in datasets:
        file_path = ROOT_DATA_PATH /\
            metadata_dict[dataset_key]["data_info"]["sub_data_dir"] /\
            metadata_dict[dataset_key]["data_info"]["local_file_name"]
        save_to_json_data(
            convert_polars_to_json(datasets[dataset_key]),
            file_path
        )
    # Delete original datasets if stated
    for dataset_key in dataset_keys:
        if not metadata_dict[dataset_key]["data_info"]["keep_original_data"]:
            os.remove(
                ROOT_DATA_PATH / 
                metadata_dict[dataset_key]["data_info"]["sub_data_dir"] /
                metadata_dict[dataset_key]["data_info"]["local_file_name"]
            )
    exit(0)
