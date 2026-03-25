# !!!!!!!!! in json files convert to is the final step in the process 
# All data processing is applied to load_as data type !!!!!!!!!!!!!!!

#TODO: Make automatic formatting work with types other than str
#TODO: Make it so that when running automatic formatting the function returns
#TODO: Specify raise conditions in doc strings
# a list of all errors so that they can all be corrected at once

from typing import Union, Callable, Any
import json
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
        # Skip key if key is not valid
        if not validate_dataset_key(data_key):
            continue
        sub_dir_data_path = root_data_path /\
                data_metadata_dict[data_key]["data_info"]["sub_data_dir"]
        # If the formatting requiers multiple files
        local_file_name =\
            data_metadata_dict[data_key]["data_info"]["local_file_name"]
        if isinstance(local_file_name,
                      list):
            sub_data_dict = {}
            for dataset_file_name in local_file_name:
                # TODO: Deale with multiple schemas using a single key !!!!!!!!
                # Check to see if a a data schema exits for this dataset
                if data_metadata_dict[data_key].get("var_info") is not None:
                    sub_data_dict[dataset_file_name] = pl.read_csv(
                        sub_dir_data_path / dataset_file_name,
                        try_parse_dates=True,
                        schema_overrides=build_data_schema(
                            data_metadata_dict[data_key]["var_info"]
                        )
                    )
                else:
                    sub_data_dict[dataset_file_name] = pl.read_csv(
                       sub_dir_data_path / dataset_file_name,
                       try_parse_dates=True
                    )
            out[data_key] = sub_data_dict
        # If files require a single file
        elif isinstance(local_file_name, str):
            if data_metadata_dict[data_key].get("var_info") is not None:
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
    """Extracts metadata to be sent co cliente and merges it with the full
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

    with open(saving_file_path, "w") as file:
        json.dump(data_dict, file, indent=10)
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


if __name__ == "__main__":
    # load metadata dict
    # If no arguments passed to script fetch all
    if len(sys.argv) == 1:
        dataset_keys = list(DATA_DICT.keys())
    else:
        dataset_keys = filter_valide_dataset_keys(sys.argv[1:])
    print(f"sys args: {sys.argv}")
    print(f"dataset keys: {dataset_keys}")
    # Load metadata dict
    metadata_dict = load_metadata_dict(dataset_keys,
                                       DATA_DICT,
                                       ROOT_DATA_PATH)
    print(f"metadata keys: {metadata_dict}")
    # Load datasets
    datasets = load_dataset(dataset_keys,
                            metadata_dict,
                            ROOT_DATA_PATH)
    # Format datasets
    datasets = format_data(datasets,
                           FORMATTING_FUNCTIONS,
                           metadata_dict)
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
