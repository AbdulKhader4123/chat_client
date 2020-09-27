import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';

import { AuthGuard } from './auth/guards/auth-guard.service';
import { NewGroupComponent } from './new-group/new-group.component';
import { ShowContactsComponent } from './show-contacts/show-contacts.component';
import { AnonymousGuard } from './auth/guards/anonymous-guard.service';

const routes: Routes = [
  { path:'login', component: LoginComponent ,canActivate: [AnonymousGuard]},
  { path:'register', component: RegisterComponent,canActivate: [AnonymousGuard] },
  { path: 'home', component: HomeComponent,canActivate: [AuthGuard]},
  { path: 'createGroup', component: NewGroupComponent,canActivate: [AuthGuard] },
  { path: 'showContacts', component: ShowContactsComponent ,canActivate: [AuthGuard]},
  { path: '', component: HomeComponent,canActivate: [AuthGuard]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
