import * as React from "react";
import { useEffect, useState } from "react";
import categoryHttp from "../../util/http/category-http";
import {
  Chip,
  Snackbar,
  MuiThemeProvider,
  Theme,
  IconButton
} from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { BadgeYes, BadgeNo } from "../../components/Badge";
import DefaultTable, {
  makeActionStyles,
  TableColumn,
} from "../../components/Table";
import { ListResponse, Category } from "../../util/models";
import { useSnackbar } from "notistack";


const columnsDefinition: TableColumn[] = [
  {
    name: "id",
    label: "ID",
    width: "30%",
    options: {
      sort: false,
    },
  },
  {
    name: "name",
    label: "Nome",
    width: "43%",
  },
  {
    name: "active",
    label: "Ativo?",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return value ? <BadgeYes /> : <BadgeNo />;
      },
    },
    width: "4%",
  },
  {
    name: "created_at",
    label: "Criado em",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return <span>{format(parseISO(value), "dd/MM/yyyy")}</span>;
      },
    },
    width: "10%",
  },
  {
    name: "actions",
    label: "Ações",
    width: "13%",
    options: {
      sort: false,
      customBodyRender: (value, tableMeta) => {
        return <IconButton 
          color={'secondary'}
          component={Link}
          to={`/categories/${tableMeta.rowData[0]}/edit`}
        >
          <EditIcon fontSize={'inherit'}/>
        </IconButton>;
      },
    },
  },
];

type Props = {};

const Table = (props: Props) => {
  const snackbar = useSnackbar();
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await categoryHttp.list<ListResponse<Category>>();
        if (isSubscribed) setData(data.data);
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
  }, []);

  return (
    <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title=""
        columns={columnsDefinition}
        data={data}
        loading={loading}
      />
    </MuiThemeProvider>
  );
};

export default Table;
