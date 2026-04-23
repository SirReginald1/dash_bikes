import sys
from typing import Union 
from pathlib import Path
import urllib.request
from urllib.request import HTTPError
import json
import datetime
from zipfile import ZipFile
from data_keys import DATA_DICT, ROOT_DATA_PATH


def is_later(first_date: str,
             second_date: str) -> bool:
    """Indicates if the first_date is earlier the the second date.
    
    Args:
        - first_date (str): The first date to be compared in format dd/mm/yyyy.
        - stored_date (str): The second date to be compared in format
            dd/mm/yyyy.

    Returns:
        - bool: True if the first date is earlier the the second date.
    """

    first_date_array = first_date.split("/")
    second_date_array = second_date.split("/")
    dt_first = datetime.date(
        int(first_date_array[2]),
        int(first_date_array[1]),
        int(first_date_array[0])
    )
    dt_second = datetime.date(
        int(second_date_array[2]),
        int(second_date_array[1]),
        int(second_date_array[0])
    )
    return dt_first < dt_second


def data_is_outdated(current_dates: dict[str, str]) -> dict[str, bool]:
    """Given a dictionary of associated data keys and associated dates
    returns a dictionary of booleans indicating if the stored data is out of
    date.

    Args: 
        - current_dates (dict[str, str]): Dictionary with data keys as values
            and last updated date listed on website as value.

    Returns:
        - dict[str, bool]: Dictionary containing data key as key and boolean
            indicating if the dataset is out of date as value.
    """

    out = {}
    for data_key in current_dates.keys():
        file_path = Path(__file__).parent / ".." / "data" /\
            DATA_DICT[data_key]["info_data_path"]
        with open(file_path, "r", encoding="utf-8") as file:
            info_data = json.load(file)
            file.close()
        out[data_key] = is_later(info_data["data_info"]["last_updated"],
                                 current_dates[data_key])
    return out
        

def fetch_data(data_keys: list[str],
               root_data_directory: Union[str, Path],
               only_if_outdated: bool = True) -> int: # Maybe only do if
    """Downloads the data for all the provided dataset keys.

    Args:
        - data_keys (list[str]): A list of dataset keys for each of the
            datasets to download. The dataset keys can be found at the
            top of the fetch_data.py file.
        - only_if_outdated (bool): If true will only update data if

    Returns:
        - int: The return code that indicates if an error occurred while
            fetching data. Return codes are as follows:
            0: Executed without errors
            1: At least least 1 error occurred while fetching files
            2: At least least 1 error occurred while updating the last update
                date
            3: At least least 1 error occurred while both fetching files and
                updating update date
    """

    exit_val = 0
    for data_key in data_keys:
        if not data_key in list(DATA_DICT.keys()):
            raise ValueError(f"The provided data key \"{data_key}\" is incorrect")
        try:
            file_path = Path(root_data_directory) /\
                DATA_DICT[data_key]["info_data_path"]
            with open(file_path, "r", encoding="utf-8") as file:
                info_data = json.load(file)
                file.close()
            print()
        except Exception as e:
            print(f"Error while loading data info for {data_key}")
            print(e)
            continue
        sub_root_folder = Path(root_data_directory)/\
            info_data["data_info"]["sub_data_dir"]
        # TODO: add is up to date check
        try:
            # Check the list of files is a list
            if isinstance(info_data["data_info"]["original_file_name"],
                          list):
                #print("Sub files list functionality not implemented yet. "
                #      "Cannot process sub files: "
                #      f"{info_data["data_info"]["original_file_name"]}")
                #continue
                if bool(info_data["data_info"]["is_ziped"]):
                    #print(f"The dataset file: {data_key}. "
                    #      f"File is ziped: {info_data["data_info"]["is_ziped"]}")
                    ziped_path = sub_root_folder / info_data["data_info"]\
                        ["ziped_name"]
                    #print(f"Ziped file: {ziped_path}")
                    zip_download_status_flag = urllib.request.urlretrieve(
                        info_data["data_info"]["data_download_url"],
                        ziped_path
                    )
                    with ZipFile(ziped_path, "r") as ziped_file:
                            for file_to_extract in info_data["data_info"]\
                                ["original_file_name"]:
                                ziped_file.extract(file_to_extract,
                                                   sub_root_folder)
            else:
                # Check the list of files is a list
                if isinstance(info_data["data_info"]["original_file_name"],
                              str):
                    #continue
                    # print(f"url: {info_data["data_info"]["data_download_url"]}")
                    # print(f"Saved to path: {sub_root_folder / info_data["data_info"]["local_file_name"]}")
                    download_status_flag = urllib.request.urlretrieve(
                        info_data["data_info"]["data_download_url"],
                        sub_root_folder / info_data["data_info"]["local_file_name"]
                    )
        except HTTPError as e:
            print(f"Incorrect url while fetching data for {data_key} "
                  f"data:\n{e}")
            exit_val = 1
            continue
        except FileNotFoundError as e:
            print(f"The local path to download to for {data_key} data does"
                  f" not exist:\n{e}")
            exit_val = 1
            continue
        except Exception as e:
            print(f"Unknown error while downloading {data_key} data:\n{e}")
            exit_val = 1
            continue
        # Only update date of last download if download successful
        #if isinstance(download_status_flag, tuple):
        try:
            info_data["data_info"]["last_updated"] = datetime.date.today().\
                strftime("%d/%m/%Y")
            with open(file_path, "w", encoding="utf-8") as output_file:
                json.dump(info_data,
                          output_file,
                          indent=5,
                          ensure_ascii=False,
                          sort_keys=True)
                output_file.close()
        except Exception as e:
            print(f"Error while updating date for file {file_path}")
            print(e)
            exit_val += 2
            continue
    return exit_val


if __name__ == "__main__":
    # If no arguments passed to script fetch all
    if len(sys.argv) == 1:
        exit_val = fetch_data(list(DATA_DICT.keys()),
                              ROOT_DATA_PATH)
    else:
        exit_val = fetch_data(sys.argv[1:],
                              ROOT_DATA_PATH)
    sys.exit(exit_val)
