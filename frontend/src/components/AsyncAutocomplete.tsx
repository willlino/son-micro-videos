import * as React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete"; 
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import { useState } from "react";

type AsyncAutocompleteProps = {
  TextFieldProps?: TextFieldProps;
};

export const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
  
  const [open, setOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  const textFieldProps: TextFieldProps = {
    margin: "normal",
    variant: "outlined",
    fullWidth: true,
    InputLabelProps: { shrink: true },
    ...(props.TextFieldProps && {...props.TextFieldProps})
  };

  const autocompleteProps: any = {
      open,
      onOpen() {
        setOpen(true);
      },
      onClose() {
        setOpen(false);
      },
      onInputChange(event, value){
        setSearchText(value);
      },
      renderInput:params => (
          <TextField 
            {...params}
            {...textFieldProps}
          />
      )
  };
  return <Autocomplete {...autocompleteProps} />;
};


export default AsyncAutocomplete;