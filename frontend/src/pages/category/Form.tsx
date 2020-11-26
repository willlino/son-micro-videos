import * as React from "react";
import {
  TextField,
  Checkbox,
  Box,
  Button,
  makeStyles,
  Theme,
  FormControlLabel,
} from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { useForm } from "react-hook-form";
import categoryHttp from "../../util/http/category-http";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "../../util/vendor/yup";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";


const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
  };
});

const validationSchema = yup.object().shape({
  name: yup.string()
    .label("Nome")
    .required()
    .max(255)
});

export const Form = () => {

  const classes = useStyles();

  const { register, handleSubmit, getValues, errors, reset, watch, setValue } = useForm<{name, active}>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      active: true,
    },
  });

  const {id} = useParams();
  const [category, setCategory] = useState(null);
  
  useEffect(() => {
    register({name: 'active'})
  }, [register]);

  useEffect(() => {
    if (!id){
      return;
    }

    categoryHttp.get(id).then(({data}) => {
      setCategory(data.data);
      reset(data.data);
    });
  }, []);

  function onSubmit(formData, event) { 
    const http = !id
      ? categoryHttp.create(formData)
      : categoryHttp.update(id, formData);

    http.then((response) => {
      console.log(response);
    });
  }

  const buttonProps: ButtonProps = {
    className: classes.submit,
    color: "secondary",
    variant: "contained",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        name="name"
        label="Nome"
        fullWidth
        variant={"outlined"}
        inputRef={register}
        error={errors.name !== undefined}
        helperText={errors.name && errors.name.message}
        InputLabelProps={{shrink: true}}
      />
      <TextField
        name="description"
        label="Descrição"
        multiline
        rows="4"
        fullWidth
        variant={"outlined"}
        margin={"normal"}
        inputRef={register}
        InputLabelProps={{shrink: true}}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="active"
            color={"primary"}
            onChange={ () => setValue('active', !getValues()['active']) }
            checked={watch('active')}
          />
        }
        label={"Ativo?"}
        labelPlacement={"end"}
      />
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
