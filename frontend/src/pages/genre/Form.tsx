import * as React from "react";
import {
  TextField,
  Checkbox,
  Box,
  Button,
  makeStyles,
  Theme,
  MenuItem,
} from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { useForm } from "react-hook-form";
import genreHttp from "../../util/http/genre-http";
import { useEffect, useState } from "react";
import categoryHttp from "../../util/http/category-http";
import * as yup from "../../util/vendor/yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => {
  return {
    submit: {
      margin: theme.spacing(1),
    },
  };
});

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
  categories_id: yup.array().label("Categorias").required(),
});

export const Form = () => {
  const classes = useStyles();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    errors,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: null,
      categories_id: [],
    },
  });

  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [genre, setGenre] = useState<{ id: string } | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const category = getValues()["categories_id"];
  const [loading, setLoading] = useState<boolean>(false);

  const buttonProps: ButtonProps = {
    className: classes.submit,
    color: "secondary",
    variant: "contained",
  };

  useEffect(() => {
    register({ name: "categories_id" });
  }, [register]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const promises = [categoryHttp.list()];

      if (id) {
        promises.push(genreHttp.get(id));
      }

      try {
        const [categoriesResponse, genreResponse] = await Promise.all(promises);
        setCategories(categoriesResponse.data.data);

        if (id) {
          setGenre(genreResponse.data.data);
          reset({
            ...genreResponse.data.data,
            categories_id: genreResponse.data.data.categories.map(
              (category) => category.id
            ),
          });
        }
      } catch (error) {
        console.log(error);
        snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function onSubmit(formData, event) {
    setLoading(true);

    try {
      const http = !genre
        ? genreHttp.create(formData)
        : genreHttp.update(genre.id, formData);

      const {data} = await http;
      snackbar.enqueueSnackbar('Gênero salvo com sucesso', {variant: "success"});

      setTimeout(() => {
        event
        ? (
          id
          ? history.replace(`/genres/${data.data.id}/edit`)
          : history.push(`/genres/${data.data.id}/edit`)
        ) : history.push(`/genres`);

      });
    } catch (error) {
      console.log(error);
      snackbar.enqueueSnackbar('Não foi possível salvar o gênero', {variant: "error"});
    } finally {
      setLoading(false);
    }

    genreHttp.create(formData).then((response) => {
      console.log(response);
    });
  }

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
        select
        name="categories_id"
        value={watch("categories_id")}
        label="Categorias"
        margin={"normal"}
        variant={"outlined"}
        fullWidth
        onChange={(e) => {
          setValue("categories_id", e.target.value);
        }}
        SelectProps={{ multiple: true }}
        disabled={loading}
        error={errors.categories_id !== undefined}
        helperText={errors.categories_id && (errors.categories_id as any).message}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="" disabled>
          <em>Selecionar categorias</em>
        </MenuItem>
        {categories.map((category, key) => (
          <MenuItem key={key} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

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
