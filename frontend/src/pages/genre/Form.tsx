import * as React from "react";
import {
  TextField,
  MenuItem,
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import genreHttp from "../../util/http/genre-http";
import { useEffect, useState } from "react";
import categoryHttp from "../../util/http/category-http";
import * as yup from "../../util/vendor/yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router-dom";
import { Category, Genre } from "../../util/models";
import SubmitActions from "../../components/SubmitActions";

const validationSchema = yup.object().shape({
  name: yup.string().label("Nome").required().max(255),
  categories_id: yup.array().label("Categorias").required(),
});

export const Form = () => {

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    errors,
    reset,
    trigger
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
  const [genre, setGenre] = useState<Genre | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const category = getValues()["categories_id"];
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    register({ name: "categories_id" });
  }, [register]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      setLoading(true);

      const promises = [categoryHttp.list({queryParams: {all: ''}})];

      if (id) {
        promises.push(genreHttp.get(id));
      }

      try {
        const [categoriesResponse, genreResponse] = await Promise.all(promises);

        if (isSubscribed) {
          setCategories(categoriesResponse.data.data);

          if (id) {
            setGenre(genreResponse.data.data);
            
            const categories_id = genreResponse.data.data.categories.map(
              (category) => category.id
            );

            reset({
              ...genreResponse.data.data,
              categories_id: categories_id,
            });
          }
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
    }
  }, []);

  async function onSubmit(formData, event) {
    setLoading(true);

    try {
      const http = !genre
        ? genreHttp.create(formData)
        : genreHttp.update(genre.id, formData);

      const { data } = await http;
      snackbar.enqueueSnackbar("Gênero salvo com sucesso", {
        variant: "success",
      });

      setTimeout(() => {
        event
          ? id
            ? history.replace(`/genres/${data.data.id}/edit`)
            : history.push(`/genres/${data.data.id}/edit`)
          : history.push(`/genres`);
      });
    } catch (error) {
      console.log(error);
      snackbar.enqueueSnackbar("Não foi possível salvar o gênero", {
        variant: "error",
      });
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
        helperText={
          errors.categories_id && (errors.categories_id as any).message
        }
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

      <SubmitActions
        disabledButtons={loading}
        handleSave={async () => {
          let isValid: boolean = await trigger();
          if (isValid) onSubmit(getValues(), null);
        }}
      ></SubmitActions>
    </form>
  );
};
