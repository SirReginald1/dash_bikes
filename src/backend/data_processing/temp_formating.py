import json
import polars as pl
from format_data import (
    load_dataset,
    load_metadata_dict
)
from data_keys import (
    ROOT_DATA_PATH,
    DATA_DICT,
    BIKE_ACCIDENTS_DATA_KEY,
    POPULATION_DOWNLOAD_KEY,
    DEPARTMENT_MAP_POLY_KEY,
    REGION_MAP_POLY_KEY
)

data_keys = [
    BIKE_ACCIDENTS_DATA_KEY,
    POPULATION_DOWNLOAD_KEY,
    DEPARTMENT_MAP_POLY_KEY,
    REGION_MAP_POLY_KEY
]

# Import data and metadata
metadata = load_metadata_dict(data_keys,
                              DATA_DICT,
                              ROOT_DATA_PATH)

data_dict = load_dataset(data_keys,
                         load_metadata_dict(data_keys,
                                            DATA_DICT,
                                            ROOT_DATA_PATH),
                         ROOT_DATA_PATH)

# Remove unwanted variables
excluded_variables = [
     "Num_Acc",
     "plan",
     "numVehicules",
     "typevehicules",
     "vehiculeid",
     "agg",
     "col",
     "com",
     "nbv",
     "lartpc",
     "larrout",
     "circ",
     "int",
     "catr", # Road categorisation
     "prof", # Road inclination type
     "surf", # Surface condition !!!!!!!
     "infra", # Ifrastructure at accident site
     "situ", # On what aménagment the acc happend !!!!!!!
     # Need special cleaning
     "equipement",
     # Not interesting
     "choc",
     # Rubish
     "manoeuvehicules",
]
data = data_dict['accidents'].drop(excluded_variables)

# Clean latitude and longitude
data = data.with_columns(pl.col("long").str.replace(",", ".")).with_columns(pl.col("lat").str.replace(",", "."))
data = data.with_columns(pl.col("long").str.replace(" ", "")).with_columns(pl.col("lat").str.replace(" ", ""))
data = data.rename({"long": "lon"})

# Replace nulls
data = data.with_columns(pl.all().fill_null(-1))

# Cast variables
data.cast({
    'date': pl.String,
    'an': pl.Int64,
    'mois': pl.String,
    'jour': pl.String,
    'hrmn': pl.String,
    'dep': pl.String,
    'lat': pl.Float64,
    'lon': pl.Float64,
    'lum': pl.Int64,
    'atm': pl.Int64,
    'grav': pl.Int64,
    'sexe': pl.Int64,
    'age': pl.Int64,
    'trajet': pl.Int64,
    'secuexist': pl.Int64,
    'obs': pl.Int64,
    'obsm': pl.Int64,
    'manv': pl.Int64
})

# Automatic range adjustment
for col_idx, var in enumerate(data.columns):
    if var == "lon":
        var = "long"
    accepted_range = metadata["accidents"]["var_info"][var].get(
        "accepted_range"
    )
    null_replace_val = metadata["accidents"]["var_info"][var].get(
        "null_replace_val"
    )
    if accepted_range is not None and null_replace_val is not None:
        new_col = data[var].to_frame().select(
            pl.when(((pl.col(var) <= accepted_range[0]) |\
                (pl.col(var) >= accepted_range[1])))\
                    .then(null_replace_val).otherwise(pl.col(var))
        ).to_series().rename(var)
        data.replace_column(col_idx, new_col)

# Specifing categorical variables
cat_vars = ["mois", "jour"]
metadata_out = {"accidentVelo": {}}
data_out = {}
for var in data.columns:
    if var == 'lon':
        metadata_out["accidentVelo"][var] = metadata["accidents"][
            "var_info"
        ]['long'].copy()
    else:
        metadata_out["accidentVelo"][var] = metadata[
            "accidents"
        ]["var_info"][var].copy()
    # Remove unwanted metadata
    var_to_exclude = metadata["accidents"]["data_info"]\
            .get("load_var_info_keys_exclude")
    if var_to_exclude is not None:
        key_list = list(metadata_out["accidentVelo"][var].keys())
        for var_info_key in key_list:
            if var_info_key in var_to_exclude:
                metadata_out["accidentVelo"][var].pop(var_info_key)
    cat_key_dict = {}
    if var in cat_vars:
        for cat_key in data[var].unique():
            cat_key_dict[cat_key] = cat_key
        metadata_out["accidentVelo"][var]["keys"] = cat_key_dict
    data_out[var] = data[var].to_list()

# Save output
with open("../data/metadata.json", "w", encoding="utf-8") as file:
    json.dump(metadata_out, file, indent=2, ensure_ascii=False)
    file.close()
with open("../data/accidentsVelo.json", "w", encoding="utf-8") as file:
    json.dump(data_out, file, indent=1, ensure_ascii=False)
    file.close()
