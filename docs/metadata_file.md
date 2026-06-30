# Metadata file

## data_info section

## var_info section
This section includes all variable specific information for both data formatting, automatic front end metadata generation and automatic front end UI building. This section must include all the variable names as they appear in the original dataset as keys. All the variables that are to be included in the front end data must be listed in this section. For each variable the following values can be specified. (Any key not listed here will simply be ignored)

### Required keys for formatting

### Optional keys

- **null_replace_val:** The value that will replace all null values with the provided value during data formatting. Must be specified if front end `FilterSelection` and `ContinuFilterSelector` is to automatically include null values in all selections.

- **accepted_range:** Array containing the smallest acceptable value as first element and largest acceptable value as second element. All values outside this range will be set to the value provided in the `null_replace_val` field during data formatting. The `null_replace_val` must be specified if `accepted_range` is specified. This value is used by the front end by `FilterSelection` and `ContinuFilterSelector` to set the maximum and minimum values that can be selected by the slider.