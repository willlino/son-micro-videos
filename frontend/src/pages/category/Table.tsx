import * as React from "react";
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { useEffect, useState } from "react";
import { httpVideo } from "../../util/http";

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: "name",
    label: "Nome",
  },
  {
    name: "active",
    label: "Ativo?",
  },
  {
    name: "created_at",
    label: "Criado em",
  },
];

type Props = {};

const data = [
  { name: "teste1", active: true, created_at: "2019-12-12" },
  { name: "teste2", active: false, created_at: "2019-11-10" },
  { name: "teste3", active: false, created_at: "2019-09-14" },
  { name: "teste4", active: true, created_at: "2019-12-20" },
];

const Table = (props: Props) => {

  const [data, setData] = useState([]);

  useEffect(() => {
    httpVideo.get('categories').then(response => 
        setData(response.data.data)
      )
  }, [])

  return (
    <div>
      <MUIDataTable
        title="Listagem de categorias"
        columns={columnsDefinition}
        data={data}
      />
    </div>
  );
};

export default Table;
