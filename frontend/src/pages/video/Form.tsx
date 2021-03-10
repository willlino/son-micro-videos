import * as React from "react";
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Grid,
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import videoHttp from "../../util/http/category-http";
import * as yup from "../../util/vendor/yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router-dom";
import { Video } from "../../util/models";
import SubmitActions from "../../components/SubmitActions";
import { DefaultForm } from "../../components/DefaultForm";

const validationSchema = yup.object().shape({
  title: yup.string().label("Título").required().max(255),
  description: yup.string().label("Sinopse").required(),
  year_launched: yup.number().label("Ano de Lançamento").required().min(1),
  duration: yup.number().label("Duração").required().min(1),
  rating: yup.string().label("Classificação").required(),
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
    trigger,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const snackbar = useSnackbar();
  const history = useHistory();
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    async function getVideo() {
      setLoading(true);

      try {
        const { data } = await videoHttp.get(id);
        setVideo(data.data);
        reset(data.data);
      } catch (error) {
        console.log(error);
        snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    getVideo();
  }, []);

  async function onSubmit(formData, event) {
    setLoading(true);

    try {
      const http = !video
        ? videoHttp.create(formData)
        : videoHttp.update(video.id, formData);

      const { data } = await http;
      snackbar.enqueueSnackbar("Vídeo salvo com sucesso", {
        variant: "success",
      });

      setTimeout(() => {
        event
          ? id
            ? history.replace(`/videos/${data.data.id}/edit`)
            : history.push(`/videos/${data.data.id}/edit`)
          : history.push(`/videos`);
      });
    } catch (error) {
      console.log(error);
      snackbar.enqueueSnackbar("Não foi possível salvar o vídeo", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }

    videoHttp.create(formData).then((response) => {
      console.log(response);
    });
  }

  return (
    <DefaultForm GridItemProps={{ xs: 12 }} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <TextField
            name="title"
            label="Título"
            fullWidth
            variant={"outlined"}
            inputRef={register}
            disabled={loading}
            error={errors.title !== undefined}
            helperText={errors.title && errors.title.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="description"
            label="Sinopse"
            multiline
            rows="4"
            fullWidth
            margin={"normal"}
            variant={"outlined"}
            inputRef={register}
            disabled={loading}
            error={errors.description !== undefined}
            helperText={errors.description && errors.description.message}
            InputLabelProps={{ shrink: true }}
          />
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                name="year_launched"
                label="Ano de Lançamento"
                type="number"
                margin="normal"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                error={errors.year_launched !== undefined}
                helperText={
                  errors.year_launched && errors.year_launched.message
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="duration"
                label="Duração"
                type="number"
                margin="normal"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                error={errors.duration !== undefined}
                helperText={errors.duration && errors.duration.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          Elenco
          <br />
          Gêneros e Categorias
        </Grid>
        <Grid item xs={12} md={6}>
          Classificação
          <br />
          Uploads
          <br />
          <FormControlLabel
            control={
              <Checkbox
                name="opened"
                color={"primary"}
                onChange={() => setValue("opened", !getValues()["opened"])}
                checked={watch("opened")}
                disabled={loading}
              />
            }
            label={
              <Typography color="primary" variant={"subtitle2"}>
                Quero que esse conteúdo apareça na seção de lançamentos
              </Typography>
            }
            labelPlacement="end"
          />
        </Grid>
        <Grid item xs={12}>
        <SubmitActions
          disabledButtons={loading}
          handleSave={async () => {
            let isValid: boolean = await trigger();
            if (isValid) onSubmit(getValues(), null);
          }}
        ></SubmitActions>
        </Grid>
      </Grid>
    </DefaultForm>
  );
};
