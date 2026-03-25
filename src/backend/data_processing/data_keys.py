# TODO: Move all this into global application json file

from pathlib import Path


# Path to the root data directory
ROOT_DATA_PATH = Path(__file__).parent / ".." / "data"

# Keys used to reference datasets in all reference dictionaries for start of
# pipeline datasets.
BIKE_ACCIDENTS_DATA_KEY = "accidents"


REGION_MAP_POLY_KEY = "geojson_region"


DEPARTMENT_MAP_POLY_KEY = "geojson_departement"


POPULATION_DOWNLOAD_KEY = "population"


# Dictionary that contains all references needed to download clean and format
# the data
DATA_DICT = {
    BIKE_ACCIDENTS_DATA_KEY: {
        "info_data_path": "bike_accident_data/accidents_info.json",
        #"polars_schema": DATA_SCHEMAS.get(BIKE_ACCIDENTS_DATA_KEY),
        #"formating_function": FORMATING_FUNCTIONS[BIKE_ACCIDENTS_DATA_KEY]
    },
    REGION_MAP_POLY_KEY: {
        "info_data_path": "geojson_map_data/region_geo_info.json",
        #"polars_schema": None,
        #"formating_function": None
    },
    DEPARTMENT_MAP_POLY_KEY: {
        "info_data_path": "geojson_map_data/departement_geo_info.json",
        #"polars_schema": None,
        #"formating_function": None
    },
    POPULATION_DOWNLOAD_KEY: {
        "info_data_path": "population/population_data_info.json",
        "sub_data_keys": ["departements", "communes", "regions"],
        #"polars_schema": DATA_SCHEMAS.get(POPULATION_DOWNLOAD_KEY),
        #"formating_function": FORMATING_FUNCTIONS[POPULATION_DOWNLOAD_KEY]
    },
    #"population_departement_and_time": {
    #    "page_url": "https://www.data.gouv.fr/datasets/serie-historique-du-recensement-de-la-population",
    #    "data_download_url": "https://www.data.gouv.fr/api/1/datasets/r/6a28c686-e621-410b-8032-1b6f3b1555c2",
    #    "is_ziped": True,
    #    "local_path": "",
    #    "last_updated": "placeholder",
    #    "formating_function": "placeholder"
    #},
    #"region_cycle_paths": {
    #    "page_url": "https://www.data.gouv.fr/datasets/lineaire-damenagements-cyclables",
    #    "formating_function": "placeholder",
    #    "variable_description": formatting_functions[""]
    #},
    #"departement_cycle_paths": {
    #    "page_url": "https://www.data.gouv.fr/datasets/lineaire-damenagements-cyclables",
    #    "data_download_url": "https://www.data.gouv.fr/api/1/datasets/r/b8d15062-e8ab-44c8-a0be-759d77838900",
    #    "is_ziped": False,
    #    "local_path": "",
    #    "last_updated": "placeholder",
    #    "formating_function": "placeholder"
    #},
    #"commune_cycle_paths": {
    #    "page_url": "https://www.data.gouv.fr/datasets/lineaire-damenagements-cyclables",
    #    "data_download_url": "https://www.data.gouv.fr/api/1/datasets/r/87e5faac-979e-48b1-9cad-57866c6d0f1c",
    #    "is_ziped": False,
    #    "local_path": "",
    #    "last_updated": "placeholder",
    #    "formating_function": "placeholder"
    #},
}


def validate_dataset_key(key: str) -> bool:
    """Checks to see if the provided dataset key is a valid dataset key.

    Args:
        - key (str): The key to check is valid.

    Return:
        - bool: True if the key is valid.
    """
    return DATA_DICT.get(key) is not None


def filter_valide_dataset_keys(keys: list[str]) -> list[str]:
    """Filters all invalide dataset keys and returns a list of valid dataset
    keys. Prints a message indicating which dataset key have been filtered.

    Args:
        - keys (list[str]): List of dataset keys to be filtered.

    Returns:
        - list[str]: The list of filtered dataset keys.
    """

    out = []
    removed = []
    for key in keys:
        if validate_dataset_key(key):
            out.append(key)
        else:
            removed.append(key)
    return out
