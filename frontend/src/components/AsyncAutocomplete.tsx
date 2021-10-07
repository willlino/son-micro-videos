import * as React from "react";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

type AsyncAutocompleteProps = {
  fetchOptions: (searchText) => Promise<any>;
  TextFieldProps?: TextFieldProps;
  AutocompleteProps?: Omit<AutocompleteProps<any, any, any, any>, 'renderInput' | 'options'>;
};

export const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
  const {AutocompleteProps} = props;
  const {freeSolo, onOpen, onClose, onInputChange} = AutocompleteProps as any;
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const snackbar = useSnackbar();

  const textFieldProps: TextFieldProps = {
    margin: "normal",
    variant: "outlined",
    fullWidth: true,
    InputLabelProps: { shrink: true },
    ...(props.TextFieldProps && { ...props.TextFieldProps }),
  };

  const autocompleteProps: AutocompleteProps<any, any, any, any> = {
    loadingText: "Carregando",
    noOptionsText: "Nenhum item encontrado",
    ...(AutocompleteProps && {...AutocompleteProps}),
    open,
    loading: loading,
    options: options ?? [],
    onOpen(event) {
      setOpen(true);
      onOpen && onOpen(event); 
    },
    onClose(event, reason) {
      setOpen(false);
      onClose && onClose(event, reason);
    },
    onInputChange(event, value, reason) {
      setSearchText(value);
      onInputChange && onInputChange(event, value, reason);
    },
    renderInput: (params) => (
      <TextField
        {...params}
        {...textFieldProps}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading && <CircularProgress color={"inherit"} size={20} />}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    ),
  };

  useEffect(() => {
    if(!open || searchText == "" && freeSolo){
      return;
    }

    let isSubscribed = true;
    (async () => {
      setLoading(true);

      try {
        const data = await props.fetchOptions(searchText);
        if (isSubscribed) {
          setOptions(data);
        }
      } catch (error) {
        console.error(error);
        snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [freeSolo ? searchText : open]);

  return <Autocomplete {...autocompleteProps} />;
};

export default AsyncAutocomplete;
