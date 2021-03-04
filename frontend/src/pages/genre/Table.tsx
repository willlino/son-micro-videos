import * as React from "react";
import { useEffect, useState, useRef } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import genreHttp from "../../util/http/genre-http";
import categoryHttp from "../../util/http/category-http";
import { BadgeYes, BadgeNo } from "../../components/Badge";
import { Category, Genre, ListResponse } from "../../util/models";
import DefaultTable, {
  makeActionStyles,
  TableColumn,
  MuiDataTableRefComponent,
} from "../../components/Table";
import { FilterResetButton } from "../../components/Table/FilterResetButton";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { useSnackbar } from "notistack";
import useFilter from "../../hooks/useFilter";
import * as yup from "../../util/vendor/yup";

const columnsDefinition: TableColumn[] = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "name",
    label: "Nome",
    options: {
      filter: false,
    },
  },
  {
    name: "categories",
    label: "Categorias",
    options: {
      filterType: "multiselect",
      filterOptions: {
        names: [],
      },
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
      filter: false,
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
      filter: false,
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

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {
  const snackbar = useSnackbar();
  const subscribed = useRef(true);
  const [data, setData] = useState<Genre[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

  const {
    columns,
    filterManager,
    filterState,
    debouncedFilterState,
    totalRecords,
    setTotalRecords,
  } = useFilter({
    columns: columnsDefinition,
    debounceTime: debounceTime,
    rowsPerPage,
    rowsPerPageOptions,
    tableRef,
    extraFilter: {
      createValidationSchema: () => {
        yup.object().shape({
          categories: yup
            .mixed()
            .nullable()
            .transform((value) => {
              return !value || value === "" ? undefined : value.split(",");
            })
            .default(null),
        });
      },
      formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
          ? {
              ...(debouncedState.extraFilter.categories && {
                categories: debouncedState.extraFilter.categories.join(","),
              }),
            }
          : undefined;
      },
      getStateFromUrl: (queryParams) => {
        return {
          categories: queryParams.get("categories"),
        };
      },
    },
  });

  const indexColumnCategories = columns.findIndex(
    (c) => c.name === "categories"
  );
  const columnCategories = columns[indexColumnCategories];
  const categoriesFilterValue =
    filterState.extraFilter && filterState.extraFilter.categories;
  (columnCategories.options as any).filterList = categoriesFilterValue
    ? categoriesFilterValue
    : [];

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      try {
        const { data } = await categoryHttp.list({ queryParams: { all: "" } });
        if (isSubscribed) {
          setCategories(data.data);
          (columnCategories.options as any).filterOptions.names = data.data.map(
            (category) => category.name
          );
        }
      } catch (error) {
        console.error(error);
        snackbar.enqueueSnackbar(
          "Não foi possível carregar as informações de categoria",
          {
            variant: "error",
          }
        );
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    subscribed.current = true;
    filterManager.pushHistory();
    getData();

    return () => {
      subscribed.current = false;
    };
  }, [
    filterManager.clearSearchText(debouncedFilterState.search),
    debouncedFilterState.pagination.page,
    debouncedFilterState.pagination.per_page,
    debouncedFilterState.order,
    JSON.stringify(debouncedFilterState.extraFilter),
  ]);

  async function getData() {
    setLoading(true);
    try {
      const { data } = await genreHttp.list<ListResponse<Genre>>({
        queryParams: {
          search: filterManager.clearSearchText(filterState.search),
          page: filterState.pagination.page,
          per_page: filterState.pagination.per_page,
          sort: filterState.order.sort,
          dir: filterState.order.dir,
          ...(debouncedFilterState.extraFilter &&
            debouncedFilterState.extraFilter.categories && {
              categories: debouncedFilterState.extraFilter.categories.join(","),
            }),
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

  return (
    <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
      <DefaultTable
        title=""
        columns={columns}
        data={data}
        loading={loading}
        debouncedSearchTime={debouncedSearchTime}
        ref={tableRef}
        options={{
          serverSide: true,
          searchText: filterState.search as any,
          page: filterState.pagination.page - 1,
          rowsPerPage: filterState.pagination.per_page,
          rowsPerPageOptions,
          count: totalRecords,
          onFilterChange: (column: any, filterList, type) => {
            const columnIndex = columns.findIndex((c) => c.name === column);
            const columnValue = filterList[columnIndex].length
              ? filterList[columnIndex]
              : null;
            filterManager.changeExtraFilter({
              [column]: columnValue,
            });
          },
          customToolbar: () => (
            <FilterResetButton
              handleClick={() => filterManager.resetFilter()}
            />
          ),
          onSearchChange: (value: any) => filterManager.changeSearch(value),
          onChangePage: (page) => filterManager.changePage(page),
          onChangeRowsPerPage: (perPage) =>
            filterManager.changeRowsPerPage(perPage),
          onColumnSortChange: (changedColumn: string, direction: string) =>
            filterManager.changeColumnSort(changedColumn, direction),
        }}
      />
    </MuiThemeProvider>
  );
};

export default Table;
