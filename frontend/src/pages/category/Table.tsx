import * as React from "react";
import { useEffect, useState, useRef } from "react";
import categoryHttp from "../../util/http/category-http";
import {
  MuiThemeProvider,
  IconButton,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { BadgeYes, BadgeNo } from "../../components/Badge";
import DefaultTable, {
  makeActionStyles,
  MuiDataTableRefComponent,
  TableColumn,
} from "../../components/Table";
import { ListResponse, Category } from "../../util/models";
import { useSnackbar } from "notistack";
import useFilter from "../../hooks/useFilter";
import { FilterResetButton } from "../../components/Table/FilterResetButton";

const columnsDefinition: TableColumn[] = [
  {
    name: "id",
    label: "ID",
    width: "30%",
    options: {
      sort: false,
      filter: false,
    },
  },
  {
    name: "name",
    label: "Nome",
    width: "43%",
    options: {
      filter: false,
    },
  },
  {
    name: "active",
    label: "Ativo?",
    options: {
      filterOptions: {
        names: ['Sim', 'Não']
      },
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
      filter: false
    },
    width: "10%",
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
            to={`/categories/${tableMeta.rowData[0]}/edit`}
          >
            <EditIcon fontSize={"inherit"} />
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
  const [data, setData] = useState<Category[]>([]);
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
  });

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
  ]);

  async function getData() {
    setLoading(true);
    try {
      const { data } = await categoryHttp.list<ListResponse<Category>>({
        queryParams: {
          search: filterManager.clearSearchText(filterState.search),
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
      if(categoryHttp.isCancelRequest(error)){
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
          customToolbar: () => (
            <FilterResetButton
              handleClick={() => filterManager.resetFilter() }
            />
          ),
          onSearchChange: (value: any) => filterManager.changeSearch(value),
          onChangePage: (page) => filterManager.changePage(page),
          onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
          onColumnSortChange: (changedColumn: string, direction: string) =>
            filterManager.changeColumnSort(changedColumn, direction)
          }}
      />
    </MuiThemeProvider>
  );
};

export default Table;
