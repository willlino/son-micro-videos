import * as React from "react";
import MUIDataTable, {
  MUIDataTableColumn,
  MUIDataTableOptions,
  MUIDataTableProps,
} from "mui-datatables";
import { merge, omit, cloneDeep } from "lodash";
import { MuiThemeProvider, Theme, useMediaQuery, useTheme } from "@material-ui/core";

export interface TableColumn extends MUIDataTableColumn {
  width?: string;
}

const defaultOptions: MUIDataTableOptions = {
  print: false,
  download: false,
  textLabels: {
    body: {
      noMatch: "Nenhum registro encontrado",
      toolTip: "Classificar",
    },
    pagination: {
      next: "Próxima página",
      previous: "Página anterior",
      rowsPerPage: "Por página:",
      displayRows: "de",
    },
    toolbar: {
      search: "Busca",
      downloadCsv: "Download CSV",
      print: "Imprimir",
      viewColumns: "Ver Colunas",
      filterTable: "Filtrar Tabelas",
    },
    filter: {
      all: "Todos",
      title: "FILTROS",
      reset: "LIMPAR",
    },
    viewColumns: {
      title: "Ver Colunas",
      titleAria: "Ver/Esconder Colunas da Tabela",
    },
    selectedRows: {
      text: "registro(s) selecionados",
      delete: "Excluir",
      deleteAria: "Excluir registros selecionados",
    },
  },
};

interface TableProps extends MUIDataTableProps {
  columns: TableColumn[];
  loading?: boolean;
}

const Table: React.FC<TableProps> = (props) => {
  function extractMUIDataTableColumns(
    columns: TableColumn[]
  ): MUIDataTableColumn[] {
    setColumnsWidth(columns);
    return columns.map((column) => omit(column, "width"));
  }

  function setColumnsWidth(columns: TableColumn[]) {
    columns.forEach((column, key) => {
      const overrides = theme.overrides as any;
      if (column.width) {
        overrides.MUIDataTableHeadCell.fixedHeader[
          `&:nth-child(${key + 2})`
        ] = {
          width: column.width,
        };
      }
    });
  }

  function applyLoading() {
    const textLabels = (newProps.options as any).textLabels;
    textLabels.body.noMatch =
      newProps.loading === true ? "Carregando..." : textLabels.body.noMatch;
  }

  function applyResponsive(){
    newProps.options.responsive = isSmOrDown ? 'standard' : 'simple';
  }

  function getOriginalMuiDataTableProps() {
    return omit(newProps, "loading");
  }

  const theme = cloneDeep<Theme>(useTheme());
  
  const isSmOrDown = useMediaQuery(theme.breakpoints.down('sm'));
  
  const newProps = merge({ options: cloneDeep(defaultOptions) }, props, {
    columns: extractMUIDataTableColumns(props.columns),
  });

  applyLoading();
  applyResponsive();
  const originalProps = getOriginalMuiDataTableProps();

  return (
    <MuiThemeProvider theme={theme}>
      <MUIDataTable {...originalProps} />
    </MuiThemeProvider>
  );
};

export default Table;
