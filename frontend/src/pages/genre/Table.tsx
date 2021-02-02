import * as React from "react";
import { useEffect, useState } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import genreHttp from '../../util/http/genre-http';
import { BadgeYes, BadgeNo } from "../../components/Badge";
import { Genre, ListResponse } from "../../util/models";
import DefaultTable, {
  makeActionStyles,
  TableColumn,
} from "../../components/Table";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';

const columnsDefinition: TableColumn[] = [
  {
    name: "id",
    label: "ID",
    options: {
      sort: false,
    },
  },
  {
    name: "name",
    label: "Nome",
  },
  {
    name: "categories",
    label: "Categorias",
    options: {
      customBodyRender(value, tableMeta, updateValue){
        return value.map(value => value.name).join(', ');
      } 
    }
  },
  {
    name: "active",
    label: "Ativo?",
    options: {
      customBodyRender(value, tableMeta, updateValue){
        return value ? <BadgeYes/> : <BadgeNo/>;
      }
    }
  },
  {
    name: "created_at",
    label: "Criado em",
    options: {
      customBodyRender(value, tableMeta, updateValue){
        return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
      }
    }
  },
  {
    name: "actions",
    label: "Ações",
    width: "13%",
    options: {
      sort: false,
      customBodyRender: (value, tableMeta) => {
        console.log(tableMeta);
        return <IconButton 
          color={'secondary'}
          component={Link}
          to={`/genres/${tableMeta.rowData[0]}/edit`}
        >
          <EditIcon/>
        </IconButton>;
      },
    },
  }
];

type Props = {};

const Table = (props: Props) => {

  const [data, setData] = useState<Genre[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      const { data } = await genreHttp.list<ListResponse<Genre>>();
      if (isSubscribed) setData(data.data);
    })();

    return () => {
      isSubscribed = false;
    };
  }, [])

  return (
    <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title=""
        columns={columnsDefinition}
        data={data}
      />
    </MuiThemeProvider>
  );
};

export default Table;
