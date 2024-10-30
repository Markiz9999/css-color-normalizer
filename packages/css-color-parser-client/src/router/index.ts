import { type RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    alias: ['/index.html'],
    name: 'home',
    component: HomeView,
  },
];
