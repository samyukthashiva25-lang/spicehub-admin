import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { UserManagement } from './pages/user-management/user-management';
import { ProductManagement } from './pages/product-management/product-management';
import { AddProduct } from './pages/add-product/add-product';



export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'users', component: UserManagement },
  { path: 'products', component: ProductManagement },
  { path: 'products/add', component: AddProduct },
  { path: 'products/edit/:id', component: AddProduct },
  { path: '**', redirectTo: 'dashboard' }
];