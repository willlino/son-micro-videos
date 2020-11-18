import * as React from 'react';
import { TextField, Checkbox, Box, Button, makeStyles, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

export const Form = () => {

    const classes = useStyles();

    const {register, handleSubmit, getValues} = useForm({
        defaultValues: {
            active: true
        }
    });

    function onSubmit(formData, event) {
        categoryHttp
          .create(formData)
          .then((response) => {
              console.log(response);
          });
    }

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: "outlined",
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} >
            <TextField
              name="name"
              label="Nome"
              fullWidth
              variant={"outlined"}
              inputRef={register}
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
            />
            <Checkbox 
              name="active"
              inputRef={register}
              color={"primary"}
              defaultChecked
            />
            Ativo?
            <Box dir={"rtl"}>
              <Button 
                {...buttonProps}
                variant={"contained"} 
                color={"primary"}
                onClick={() => onSubmit(getValues(), null)}
              >Salvar</Button>
              <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>  
            </Box>
        </form>
    );
};