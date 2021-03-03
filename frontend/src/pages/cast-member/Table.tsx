import * as React from "react";
import { useEffect, useState, useRef } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import castMemberHttp from "../../util/http/cast-member-http";
import { ListResponse, CastMember, CastMemberTypeMap } from "../../util/models";
import DefaultTable, {
  makeActionStyles,
  MuiDataTableRefComponent,
  TableColumn,
} from "../../components/Table";
import { FilterResetButton } from "../../components/Table/FilterResetButton";
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { useSnackbar } from "notistack";
import useFilter from "../../hooks/useFilter";
import * as yup from "../../util/vendor/yup";
import { invert } from "lodash";

const castMemberNames = Object.values(CastMemberTypeMap);

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
      filter: false
    },
  },
  {
    name: "type",
    label: "Tipo",
    options: {
      filterOptions: {
        names: castMemberNames,
      },
      customBodyRender(value, tableMeta, updateValue) {
        return CastMemberTypeMap[value];
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
      }
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
            to={`/cast-members/${tableMeta.rowData[0]}/edit`}
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
  const [data, setData] = useState<CastMember[]>([]);
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
        return yup.object().shape({
          type: yup
            .string()
            .nullable()
            .transform((value) => {
              return !value || !castMemberNames.includes(value)
                ? undefined
                : value;
            })
            .default(null),
        });
      },
      formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
          ? {
              ...(debouncedState.extraFilter.type && {
                type: debouncedState.extraFilter.type,
              }),
            }
          : undefined;
      },
      getStateFromUrl: (queryParams) => {
        return { type: queryParams.get("type") };
      },
    },
  });

  const indexColumnType = columns.findIndex((c) => c.name === "type");
  const columnType = columns[indexColumnType];
  const typeFilterValue =
    filterState.extraFilter && (filterState.extraFilter.type as never);
  (columnType as any).filterList = typeFilterValue ? [typeFilterValue] : [];


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
    JSON.stringify(debouncedFilterState.extraFilter)
  ]);

  async function getData() {
    setLoading(true);
    try {
      const { data } = await castMemberHttp.list<ListResponse<CastMember>>({
        queryParams: {
          search: filterManager.clearSearchText(filterState.search),
          page: filterState.pagination.page,
          per_page: filterState.pagination.per_page,
          sort: filterState.order.sort,
          dir: filterState.order.dir,
          ...(
            debouncedFilterState.extraFilter && debouncedFilterState.extraFilter.type &&
            {type: invert(CastMemberTypeMap)[debouncedFilterState.extraFilter.type]}
        )
        },
      });
      if (subscribed.current) {
        setData(data.data);
        setTotalRecords(data.meta.total);
      }
    } catch (error) {
      console.error(error);

      if (castMemberHttp.isCancelRequest(error)) {
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
            const columnIndex = columns.findIndex(c => c.name === column);
            const columnValue = filterList[columnIndex].length ? filterList[columnIndex][0] : null;
            filterManager.changeExtraFilter({
              [column]: columnValue,
            })
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
