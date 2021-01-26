import * as React from "react";
import { Grid, GridProps, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    gridItem: {
        padding: theme.spacing(1, 0)
    }
}));

interface DefaultFormProps
  extends React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  > {
  GridContainerProps?: GridProps;
  GridItemProps?: GridProps;
}

export const DefaultForm: React.FC<DefaultFormProps> = (props) => {
  const { GridContainerProps, GridItemProps, ...other } = props;

  const classes = useStyles();
  return (
    <form {...other}>
      <Grid container {...GridContainerProps}>
        <Grid className={classes.gridItem} item {...GridItemProps}>
          {props.children}
        </Grid>
      </Grid>
    </form>
  );
};
