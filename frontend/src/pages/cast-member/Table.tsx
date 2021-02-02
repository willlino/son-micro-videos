import * as React from "react";
import { useEffect, useState } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import castMemberHttp from "../../util/http/cast-member-http";
import { ListResponse, CastMember } from "../../util/models";
import DefaultTable, {
  makeActionStyles,
  TableColumn,
} from "../../components/Table";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { useSnackbar } from "notistack";

const CastMemberTypeMap = {
  1: "Diretor",
  2: "Ator",
};

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
    name: "type",
    label: "Tipo",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return CastMemberTypeMap[value];
      },
    },
  },
  {
    name: "created_at",
    label: "Criado em",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return <span>{format(parseISO(value), "dd/MM/yyyy")}</span>;
      },
    },
  },
  {
    name: "actions",
    label: "Ações",
    width: "13%",
    options: {
      sort: false,
      customBodyRender: (value, tableMeta) => {
        return (
          <IconButton
            color={"secondary"}
            component={Link}
            to={`/cast-members/${tableMeta.rowData[0]}/edit`}
          >
            <EditIcon />
          </IconButton>
        );
      },
    },
  },
];

type Props = {};

const Table = (props: Props) => {
  const snackbar = useSnackbar();
  const [data, setData] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await castMemberHttp.list<ListResponse<CastMember>>();
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
