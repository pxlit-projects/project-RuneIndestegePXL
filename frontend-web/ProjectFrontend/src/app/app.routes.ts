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


export const routes: Routes = [
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', component: UserSelectionComponent },

  { path: 'posts', component: PostListComponent },
  { path: 'post-comments', component: PostCommentsComponent },

  { path: 'notifications', component: PostListComponent },

  { path: 'drafts', component: DraftListComponent },
  { path: 'create-update', component: CreateUpdateComponent},

  { path: 'approved', component: ApprovedListComponent },
  { path : 'rejected', component: RejectedListComponent },
  //{  path : 'create-update', component: CreateUpdateComponent },

  { path: 'reviews', component: ReviewListComponent },
  { path: 'review-post', component: ReviewPostComponent },
];
