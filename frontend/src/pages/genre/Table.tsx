import * as React from "react";
import { useEffect, useState, useRef } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import genreHttp from "../../util/http/genre-http";
import { BadgeYes, BadgeNo } from "../../components/Badge";
import { Genre, ListResponse } from "../../util/models";
import DefaultTable, {
  makeActionStyles,
  TableColumn,
} from "../../components/Table";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { useSnackbar } from "notistack";

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

interface Pagination {
  page: number;
  total: number;
  per_page: number;
}

interface Order {
  sort: string | null;
  dir: string | null;
}

interface SearchState {
  search: string;
  pagination: Pagination;
  order: Order;
}

const Table = () => {
  const initialState = {
    search: "",
    pagination: {
      page: 1,
      total: 0,
      per_page: 10,
    },
    order: {
      sort: null,
      dir: null,
    },
  };
  const snackbar = useSnackbar();
  const subscribed = useRef(true);
  const [data, setData] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchState, setSearchState] = useState<SearchState>(initialState);

  const columns = columnsDefinition.map((column) => {
    return column.name === searchState.order.sort
      ? {
          ...column,
          options: {
            ...column.options,
            sortDirection: searchState.order.dir as any,
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
    searchState.search,
    searchState.pagination.page,
    searchState.pagination.per_page,
    searchState.order,
  ]);

  async function getData() {
    setLoading(true);
    try {
      const { data } = await genreHttp.list<ListResponse<Genre>>({
        queryParams: {
          search: searchState.search,
          page: searchState.pagination.page,
          per_page: searchState.pagination.per_page,
          sort: searchState.order.sort,
          dir: searchState.order.dir,
        },
      });
      if (subscribed.current) {
        setData(data.data);
        setSearchState(
          (prevState) =>
            ({
              ...prevState,
              pagination: {
                ...prevState.pagination,
                total: data.meta.total,
              },
            } as SearchState)
        );
      }
    } catch (error) {
      console.error(error);
      if(genreHttp.isCancelRequest(error)){
        return;
      }
      
      snackbar.enqueueSnackbar("Não foi possível carregar as informações", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title=""
        columns={columns}
        data={data}
        loading={loading}
        options={{
          serverSide: true,
          searchText: searchState.search,
          page: searchState.pagination.page - 1,
          rowsPerPage: searchState.pagination.per_page,
          count: searchState.pagination.total,
          customToolbar: () => (
            <FilterResetButton handleClick={() => {
              setSearchState(initialState);
            }}/>
          ),
          onSearchChange: (value) =>
            setSearchState(
              (prevState) =>
                ({
                  ...prevState,
                  search: value,
                  pagination: {
                    ...prevState.pagination,
                    page: 1
                  }
                } as SearchState)
            ),
          onChangePage: (page) =>
            setSearchState(
              (prevState) =>
                ({
                  ...prevState,
                  pagination: {
                    ...prevState.pagination,
                    page: page + 1,
                  },
                } as SearchState)
            ),
          onChangeRowsPerPage: (perPage) =>
            setSearchState(
              (prevState) =>
                ({
                  ...prevState,
                  pagination: {
                    ...prevState.pagination,
                    per_page: perPage,
                  },
                } as SearchState)
            ),
          onColumnSortChange: (changedColumn: string, direction: string) =>
            setSearchState(
              (prevState) =>
                ({
                  ...prevState,
                  order: {
                    sort: changedColumn,
                    dir: direction.includes("desc") ? "desc" : "asc",
                  },
                } as SearchState)
            ),
        }}
      />
    </MuiThemeProvider>
  );
};

export default Table;
