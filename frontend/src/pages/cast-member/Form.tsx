import * as React from "react";
import {
  TextField,
  Checkbox,
  Box,
  Button,
  makeStyles,
  Theme,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { useForm } from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import { useEffect } from "react";

const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
  };
});

export const Form = () => {
  const classes = useStyles();

  const { register, handleSubmit, getValues, setValue } = useForm();

  useEffect(() => {
      register({name: "type"});
  }, [register])

  function onSubmit(formData, event) {
    castMemberHttp.create(formData).then((response) => {
      console.log(response);
    });
  }

  const buttonProps: ButtonProps = {
    className: classes.submit,
    variant: "outlined",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        name="name"
        label="Nome"
        fullWidth
        variant={"outlined"}
        inputRef={register}
      />

      <FormControl margin="normal">
        <FormLabel component="legend">Type</FormLabel>
        <RadioGroup aria-label="type" name="type" onChange={(e) => {
            setValue('type', parseInt(e.target.value));
        }}>
          <FormControlLabel value="1" control={<Radio />} label="Diretor" />
          <FormControlLabel value="2" control={<Radio />} label="Ator" />
        </RadioGroup>
      </FormControl>

      <Box dir={"rtl"}>
        <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>
          Salvar
        </Button>
        <Button {...buttonProps} type="submit">
          Salvar e continuar editando
        </Button>
      </Box>
    </form>
  );
};
