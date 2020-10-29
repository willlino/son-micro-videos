import {RouteProps} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/cateogory/List";


interface MyRouteProps extends RouteProps{
    label:string;
}

const routes: MyRouteProps[] = [
    {
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        label: 'Listar Categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    }
];

export default routes;