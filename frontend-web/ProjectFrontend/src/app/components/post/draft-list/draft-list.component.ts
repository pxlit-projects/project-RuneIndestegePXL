import { Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Post } from '../../../models/post.model';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [AsyncPipe, DatePipe, MatButtonModule],
  templateUrl: './draft-list.component.html',
  styleUrls: ['./draft-list.component.css']
})
export class DraftListComponent  implements OnInit {
  private postService: PostService = inject(PostService);
  private router: Router = inject(Router);
  public posts: Observable<Post[]> = of([]);
  
  ngOnInit(): void {
      this.posts = this.postService.getDraftPosts();
  }

  navigateToDraft(post: Post) {
    this.postService.setSelectedPost(post);
    this.router.navigate(['/create-update']);
}
  navigateToNewDraft() {
    this.postService.clearSelectedPost();
    this.router.navigate(['/create-update']);
  }
}