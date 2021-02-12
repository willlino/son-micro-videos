import * as React from "react";
import { useEffect, useState, useRef, useReducer } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import genreHttp from "../../util/http/genre-http";
import { BadgeYes, BadgeNo } from "../../components/Badge";
import { Genre, ListResponse } from "../../util/models";
import DefaultTable, {
  makeActionStyles,
  TableColumn,
} from "../../components/Table";
import { FilterResetButton } from "../../components/Table/FilterResetButton";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { useSnackbar } from "notistack";
import reducer, { INITIAL_STATE, Creators } from "../../store/filter";

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
      customBodyRender(value, tableMeta, updateValue) {
        return value.map((value) => value.name).join(", ");
      },
    },
  },
  {
    name: "active",
    label: "Ativo?",
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return value ? <BadgeYes /> : <BadgeNo />;
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
            to={`/genres/${tableMeta.rowData[0]}/edit`}
          >
            <EditIcon />
          </IconButton>
        );
      },
    },
  },
];

const Table = () => {
  const snackbar = useSnackbar();
  const subscribed = useRef(true);
  const [data, setData] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [filterState, dispatch] = useReducer(reducer, INITIAL_STATE);

  const columns = columnsDefinition.map((column) => {
    return column.name === filterState.order.sort
      ? {
          ...column,
          options: {
            ...column.options,
            sortDirection: filterState.order.dir as any,
          },
        }
      : column;
  });

  useEffect(() => {
    subscribed.current = true;

    getData();
    return () => {
      subscribed.current = false;
    };
  }, [
    filterState.search,
    filterState.pagination.page,
    filterState.pagination.per_page,
    filterState.order,
  ]);

  async function getData() {
    setLoading(true);
    try {
      const { data } = await genreHttp.list<ListResponse<Genre>>({
        queryParams: {
          search: clearSearchText(filterState.search),
          page: filterState.pagination.page,
          per_page: filterState.pagination.per_page,
          sort: filterState.order.sort,
          dir: filterState.order.dir,
        },
      });
      if (subscribed.current) {
        setData(data.data);
        setTotalRecords(data.meta.total);
      }
    } catch (error) {
      console.error(error);
      if (genreHttp.isCancelRequest(error)) {
        return;
      }

      snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function clearSearchText(text) {
    let newText = text;
    if (text && text.value !== undefined) {
      newText = text.value;
    }

    return newText;
  }

  return (
    <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title=""
        columns={columns}
        data={data}
        loading={loading}
        debouncedSearchTime={500}
        options={{
          serverSide: true,
          searchText: filterState.search as any,
          page: filterState.pagination.page - 1,
          rowsPerPage: filterState.pagination.per_page,
          count: totalRecords,
          customToolbar: () => (
            <FilterResetButton
              handleClick={() => dispatch(Creators.setReset())}
            />
          ),
          onSearchChange: (value: any) =>
            dispatch(Creators.setSearch({ search: value })),
          onChangePage: (page) =>
            dispatch(Creators.setPage({ page: page + 1 })),
          onChangeRowsPerPage: (perPage) =>
            dispatch(Creators.setPerPage({ per_page: perPage })), 
          onColumnSortChange: (changedColumn: string, direction: string) =>
            dispatch(
              Creators.setOrder({
                sort: changedColumn,
                dir: direction.includes("desc") ? "desc" : "asc",
              })
            ),
        }}
      />
    </MuiThemeProvider>
  );
};

export default Table;
