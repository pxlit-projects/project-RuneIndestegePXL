import { Routes } from '@angular/router';
import { PostListComponent } from './components/post/post-list/post-list.component';
import { UserSelectionComponent } from './components/user-selection/user-selection.component';
import { PostCommentsComponent } from './components/post/post-comments/post-comments.component';
import { ReviewListComponent } from './components/review/review-list/review-list.component';
import { ReviewPostComponent } from './components/review/review-post/review-post.component';
import { DraftListComponent } from './components/post/draft-list/draft-list.component';
import { CreateUpdateComponent } from './components/post/create-update/create-update.component';
import { RejectedListComponent } from './components/post/rejected-list/rejected-list.component';
import { ApprovedListComponent } from './components/post/approved-list/approved-list.component';
import { Error404Component } from './components/Error404/Error404.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', component: UserSelectionComponent },

  { path: 'posts', component: PostListComponent, canActivate: [authGuard] ,  data: { role: 'guest' }},
  { path: 'post-comments/:id', component: PostCommentsComponent, canActivate: [authGuard],  data: { role: 'guest' }},

  { path: 'notifications', component: PostListComponent, canActivate: [authGuard] ,  data: { role: 'editor' }},

  { path: 'drafts', component: DraftListComponent, canActivate: [authGuard] , data: { role: 'editor' }},
  { path: 'create-update', component: CreateUpdateComponent, canActivate: [authGuard] , data: { role: 'editor' } },

  { path: 'approved', component: ApprovedListComponent, canActivate: [authGuard] , data: { role: 'editor' }},
  { path : 'rejected', component: RejectedListComponent, canActivate: [authGuard] , data: { role: 'editor' }},

  { path: 'reviews', component: ReviewListComponent, canActivate: [authGuard] , data: { role: 'head_editor' }},
  { path: 'review-post', component: ReviewPostComponent, canActivate: [authGuard] , data: { role: 'head_editor' }},
  { path : '**', component: Error404Component }
];
