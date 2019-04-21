import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { RegisterMaterialComponent } from './page/register-material/register-material.component';
import { RegisterProductComponent } from './page/register-product/register-product.component';
import { RegisterCompanyComponent } from './page/register-company/register-company.component';
import { RegisterLocationComponent } from './page/register-location/register-location.component';
import { ListProductComponent } from './page/list-product/list-product.component';
import { ListMaterialComponent } from './page/list-material/list-material.component';
import { ListCompanyComponent } from './page/list-company/list-company.component';
import { ListLocationComponent } from './page/list-location/list-location.component';
import { ListUserComponent } from './page/list-user/list-user.component';
import { DetailCompanyComponent } from './page/detail-company/detail-company.component';
import { DetailLocationComponent } from './page/detail-location/detail-location.component';
import { DetailUserComponent } from './page/detail-user/detail-user.component';
import { DetailProductComponent } from './page/detail-product/detail-product.component';
import { DetailMaterialComponent } from './page/detail-material/detail-material.component';
import { ListInventoryComponent } from './page/list-inventory/list-inventory.component';
import { LoginComponent } from './page/login/login.component';
import { RegisterUserComponent } from './page/register-user/register-user.component';
import { ListMemoComponent } from './page/list-memo/list-memo.component';
import { AuthGuard } from './guard/auth-guard/auth.guard';
import { ResetPasswordComponent } from './page/reset-password/reset-password.component';
import { PurchaseInventoryComponent } from './page/purchase-inventory/purchase-inventory.component';
import { ConsumeInventoryComponent } from './page/consume-inventory/consume-inventory.component';
import { MoveInventoryComponent } from './page/move-inventory/move-inventory.component';
import { ManufactureInventoryComponent } from './page/manufacture-inventory/manufacture-inventory.component';
import { AdjustInventoryComponent } from './page/adjust-inventory/adjust-inventory.component';
import { RegisterMaterialFromFileComponent } from './page/register-material-from-file/register-material-from-file.component';
import { NotFoundComponent } from './page/not-found/not-found.component';
import { RegisterProductFromFileComponent } from './page/register-product-from-file/register-product-from-file.component';
import { BackupComponent } from './page/backup/backup.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'password/reset', component: ResetPasswordComponent },
  { path: 'memo/list', component: ListMemoComponent, canActivate: [AuthGuard] },
  { path: 'product/list', component: ListProductComponent, canActivate: [AuthGuard] },
  { path: 'material/list', component: ListMaterialComponent, canActivate: [AuthGuard] },
  { path: 'company/list', component: ListCompanyComponent, canActivate: [AuthGuard] },
  { path: 'location/list', component: ListLocationComponent, canActivate: [AuthGuard] },
  { path: 'user/list', component: ListUserComponent, canActivate: [AuthGuard] },
  { path: 'inventory/list', component: ListInventoryComponent, canActivate: [AuthGuard] },
  { path: 'inventory/backup', component: BackupComponent, canActivate: [AuthGuard] },
  { path: 'inventory/purchase', component: PurchaseInventoryComponent, canActivate: [AuthGuard] },
  { path: 'inventory/consume', component: ConsumeInventoryComponent, canActivate: [AuthGuard] },
  { path: 'inventory/move', component: MoveInventoryComponent, canActivate: [AuthGuard] },
  { path: 'inventory/manufacture', component: ManufactureInventoryComponent, canActivate: [AuthGuard] },
  { path: 'inventory/adjust', component: AdjustInventoryComponent, canActivate: [AuthGuard] },
  { path: 'material/register', component: RegisterMaterialComponent, canActivate: [AuthGuard]},
  { path: 'material/register/from-csv', component: RegisterMaterialFromFileComponent, canActivate: [AuthGuard] },
  { path: 'product/register/from-csv', component: RegisterProductFromFileComponent, canActivate: [AuthGuard] },
  { path: 'product/register', component: RegisterProductComponent, canActivate: [AuthGuard] },
  { path: 'location/register', component: RegisterLocationComponent, canActivate: [AuthGuard] },
  { path: 'company/register', component: RegisterCompanyComponent, canActivate: [AuthGuard] },
  { path: 'user/register', component: RegisterUserComponent, canActivate: [AuthGuard] },
  { path: 'company/detail/:id', component: DetailCompanyComponent, canActivate: [AuthGuard] },
  { path: 'location/detail/:id', component: DetailLocationComponent, canActivate: [AuthGuard] },
  { path: 'user/detail/:uid', component: DetailUserComponent, canActivate: [AuthGuard] },
  { path: 'product/detail/:id', component: DetailProductComponent, canActivate: [AuthGuard] },
  { path: 'material/detail/:type/:id', component: DetailMaterialComponent, canActivate: [AuthGuard] },
  { path: '404', component: NotFoundComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: '**', redirectTo: '404', pathMatch: 'full'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule { }
