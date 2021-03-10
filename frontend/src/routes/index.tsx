import {RouteProps} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/PageList";
import CategoryForm from "../pages/category/PageForm";
import GenreList from "../pages/genre/PageList";
import GenreForm from "../pages/genre/PageForm";
import CastMemberList from "../pages/cast-member/PageList";
import CastMemberForm from "../pages/cast-member/PageForm";
import VideoList from "../pages/video/PageList";
import VideoForm from "../pages/video/PageForm";


export interface MyRouteProps extends RouteProps {
    name:string;
    label:string;
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'Listar Categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.create',
        label: 'Criar Categorias',
        path: '/categories/create',
        component: CategoryForm,
        exact: true
    },
    {
        name: 'categories.edit', 
        label: 'Editar Categorias',
        path: '/categories/:id/edit',
        component: CategoryForm,
        exact: true
    },
    {
        name: 'genres.list',
        label: 'Listar Gêneros',
        path: '/genres',
        component: GenreList,
        exact: true
    },
    {
        name: 'genres.create',
        label: 'Criar Gênero',
        path: '/genres/create',
        component: GenreForm,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar Gênero',
        path: '/genres/:id/edit',
        component: GenreForm,
        exact: true
    },
    {
        name: 'cast_members.list',
        label: 'Listar Membros de Elenco',
        path: '/cast-members',
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast_members.create',
        label: 'Criar Membro de Elenco',
        path: '/cast-members/create',
        component: CastMemberForm,
        exact: true
    },
    {
        name: 'cast_members.edit',
        label: 'Editar Membro de Elenco',
        path: '/cast-members/:id/edit',
        component: CastMemberForm,
        exact: true
    },
    
    {
        name: 'videos.list',
        label: 'Listar Vídeos',
        path: '/videos',
        component: VideoList,
        exact: true
    },
    {
        name: 'videos.create',
        label: 'Criar Vídeo',
        path: '/videos/create',
        component: VideoForm,
        exact: true
    },
    {
        name: 'videos.edit',
        label: 'Editar Vídeo',
        path: '/videos/:id/edit',
        component: VideoForm,
        exact: true
    }
];

export default routes;