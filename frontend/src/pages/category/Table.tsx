import * as React from "react";
import { MUIDataTableColumn } from "mui-datatables";
import { useEffect, useState } from "react";
import categoryHttp from "../../util/http/category-http";
import { Chip } from "@material-ui/core";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { BadgeYes, BadgeNo } from "../../components/Badge";
import DefaultTable from "../../components/Table";
import { ListResponse, Category } from "../../util/models";

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: "name",
    label: "Nome",
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
];

type Props = {};

const Table = (props: Props) => {
  const [data, setData] = useState<Category[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      const { data } = await categoryHttp.list<ListResponse<Category>>();
      if (isSubscribed) setData(data.data);
    })();

    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
      <DefaultTable title="" columns={columnsDefinition} data={data} />
  );
};

export default Table;
