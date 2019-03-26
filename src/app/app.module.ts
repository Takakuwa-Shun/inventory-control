import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RegisterMaterialComponent } from './page/register-material/register-material.component';
import { RegisterProductComponent } from './page/register-product/register-product.component';
import { HeaderComponent } from './component/header/header.component';
import { ListProductComponent } from './page/list-product/list-product.component';
import { ListMaterialComponent } from './page/list-material/list-material.component';
import { MaterialService } from './service/material-service/material.service';
import { ProductService } from './service/product-service/product.service';
import { LocationService } from './service/location-service/location.service';
import { UserService } from './service/user-service/user.service';
import { CompanyService } from './service/company-service/company.service';
import { MemoService } from './service/memo-service/memo.service';
import { LocalStorageService } from './service/local-storage-service/local-storage.service';
import { InventoryService } from './service/inventory-service/inventory.service';
import { GoogleDriveService } from './service/google-drive/google-drive.service';
import { AuthService } from './service/auth-service/auth.service';
import { EmailService } from './service/email-service/email.service';
import { FirebaseStorageService } from './service/firebase-storage-service/firebase-storage.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from './component/confirm-modal/confirm-modal.component';
import { SimpleModalComponent } from './component/simple-modal/simple-modal.component';
import { RegisterCompanyComponent } from './page/register-company/register-company.component';
import { RegisterLocationComponent } from './page/register-location/register-location.component';
import { ListCompanyComponent } from './page/list-company/list-company.component';
import { ListLocationComponent } from './page/list-location/list-location.component';
import { ListUserComponent } from './page/list-user/list-user.component';
import { DetailCompanyComponent } from './page/detail-company/detail-company.component';
import { DetailLocationComponent } from './page/detail-location/detail-location.component';
import { DetailUserComponent } from './page/detail-user/detail-user.component';
import { DetailProductComponent } from './page/detail-product/detail-product.component';
import { DetailMaterialComponent } from './page/detail-material/detail-material.component';
import { CompleteModalComponent } from './component/complete-modal/complete-modal.component';
import { ListInventoryComponent } from './page/list-inventory/list-inventory.component';
import { LoginComponent } from './page/login/login.component';
import { RegisterUserComponent } from './page/register-user/register-user.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core'
import { CookieService } from 'ngx-cookie-service';
import { SubHeaderComponent } from './component/sub-header/sub-header.component';
import { ListMemoComponent } from './page/list-memo/list-memo.component';
import { NgxLoadingModule } from 'ngx-loading';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { ResetPasswordComponent } from './page/reset-password/reset-password.component';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { PurchaseInventoryComponent } from './page/purchase-inventory/purchase-inventory.component';
import { ConsumeInventoryComponent } from './page/consume-inventory/consume-inventory.component';
import { MoveInventoryComponent } from './page/move-inventory/move-inventory.component';
import { ManufactureInventoryComponent } from './page/manufacture-inventory/manufacture-inventory.component';
import { AdjustInventoryComponent } from './page/adjust-inventory/adjust-inventory.component';
import { RegisterMaterialFromFileComponent } from './page/register-material-from-file/register-material-from-file.component';
import { NotFoundComponent } from './page/not-found/not-found.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCropperWrapperComponent } from './component/image-cropper-wrapper/image-cropper-wrapper.component';
import { faPrint, faFileCsv, faCaretLeft, faTimes} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    AppComponent,
    RegisterMaterialComponent,
    RegisterProductComponent,
    HeaderComponent,
    ListProductComponent,
    ListMaterialComponent,
    ConfirmModalComponent,
    SimpleModalComponent,
    RegisterCompanyComponent,
    RegisterLocationComponent,
    ListCompanyComponent,
    ListLocationComponent,
    ListUserComponent,
    DetailCompanyComponent,
    DetailLocationComponent,
    DetailUserComponent,
    DetailProductComponent,
    DetailMaterialComponent,
    CompleteModalComponent,
    ListInventoryComponent,
    LoginComponent,
    RegisterUserComponent,
    SubHeaderComponent,
    ListMemoComponent,
    ResetPasswordComponent,
    PurchaseInventoryComponent,
    ConsumeInventoryComponent,
    MoveInventoryComponent,
    ManufactureInventoryComponent,
    AdjustInventoryComponent,
    RegisterMaterialFromFileComponent,
    NotFoundComponent,
    ImageCropperWrapperComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NguiAutoCompleteModule,
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    NgxLoadingModule.forRoot({
      fullScreenBackdrop: true
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    ImageCropperModule,
  ],
  providers: [
    CookieService,
    MaterialService,
    ProductService,
    LocalStorageService,
    LocationService,
    UserService,
    CompanyService,
    InventoryService,
    MemoService,
    GoogleDriveService,
    AuthService,
    EmailService,
    FirebaseStorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

  constructor() {
    library.add(faPrint);
    library.add(faFileCsv);
    library.add(faCaretLeft);
    library.add(faTimes);
  }
}
