import * as React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete"; 
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import { AutocompleteProps } from "@material-ui/core";

type AsyncAutocompleteProps = {
  TextFieldProps?: TextFieldProps;
};

export const AyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
  const textFieldProps: TextFieldProps = {
    margin: "normal",
    variant: "outlined",
    fullWidth: true,
    InputLabelProps: { shrink: true },
  };

  const autocompleteProps: AutocompleteProps = {
      renderInput:params => (
          <TextField 
            {...params}
            {...textFieldProps}
          />
      )
  };
  return <Autocomplete />;
};
