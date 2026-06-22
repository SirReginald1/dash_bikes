# temp notes

`merging_data` attribute in dataset metadata contains all the data relative to the formatting of the related dataset.
All attributes of the element represent a dataset used to in the formatting of the related dataset.

Each attribute can contain the following the values:

- **local_path:** The path to the dataset. The base of the path is the data folder that contains all of the application data.
- **match_current_data_key:** The key or variable name in the metadata related dataset of the values to be used in order to match observations between datasets. If the value is a list each value in the list is the key in a json dictionary. The keys make a path from an individual in a list to the value to extract.
- **match_other_data_key:** Same as `match_current_data_key` for the dataset used for formatting.
- **insert_data_to:** The name of the variable into which the data will be inserted. If value is a list the elements represent the keys of json dictionary in order to the position where the data will be stored.
- **vars:** List where each element contains all information needed to format the related variable.
  - **var:** The name of the variable as it appears in the data. A list of if ordered keys if data is in json format.
  - **new_var_name:** The name of the new variable or dictionary key.
  - **formatting_function:** ????????????