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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "../../util/vendor/yup";
import { useHistory, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
  };
});

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
});

export const Form = () => {
  const classes = useStyles();

  const {
    register,
    handleSubmit,
    getValues,
    errors,
    reset,
    watch,
    setValue,
  } = useForm<{ name; active }>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      active: true,
    },
  });

  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [category, setCategory] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    register({ name: "active" });
  }, [register]);

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    categoryHttp
      .get(id)
      .then(({ data }) => {
        setCategory(data.data);
        reset(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function onSubmit(formData, event) {
    const http = !category
      ? categoryHttp.create(formData)
      : categoryHttp.update(category.id, formData);

    setLoading(true);
    http
      .then(({data}) => {
        snackbar.enqueueSnackbar('Categoria salva com sucesso!', {variant: "success"});
        setTimeout(() => {
          event 
          ? (
            id 
            ? history.replace(`/categories/${data.data.id}/edit`)
            : history.push(`/categories/${data.data.id}/edit`)
  
          ) : history.push(`/categories`);
        });
      })
      .catch((error) => {
        console.log(error);
        snackbar.enqueueSnackbar('Não foi possível salvar a categoria', {variant: "error"})
      })
      .finally(() => setLoading(false));
  }

  const buttonProps: ButtonProps = {
    className: classes.submit,
    color: "secondary",
    variant: "contained",
    disabled: loading
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        name="name"
        label="Nome"
        fullWidth
        variant={"outlined"}
        inputRef={register}
        disabled={loading}
        error={errors.name !== undefined}
        helperText={errors.name && errors.name.message}
        InputLabelProps={{ shrink: true }}
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
        disabled={loading}
        InputLabelProps={{ shrink: true }}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="active"
            color={"primary"}
            onChange={() => setValue("active", !getValues()["active"])}
            checked={watch("active")}
          />
        }
        label={"Ativo?"}
        labelPlacement={"end"}
        disabled={loading}
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
