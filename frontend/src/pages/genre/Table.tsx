import * as React from "react";
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { useEffect, useState } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import genreHttp from '../../util/http/genre-http';
import { BadgeYes, BadgeNo } from "../../components/Badge";
import { Genre, ListResponse } from "../../util/models";

const columnsDefinition: MUIDataTableColumn[] = [
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
    <div>
      <MUIDataTable
        title=""
        columns={columnsDefinition}
        data={data}
      />
    </div>
  );
};

export default Table;
