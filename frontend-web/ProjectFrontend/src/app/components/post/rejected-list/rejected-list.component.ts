import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { PostComponent } from '../post/post.component';
@Component({
  selector: 'app-rejected-list',
  standalone: true,
  imports: [AsyncPipe, PostComponent],
  templateUrl: './rejected-list.component.html',
  styleUrls: ['./rejected-list.component.css']
})
export class RejectedListComponent implements OnInit {
  public postService = inject(PostService);
    public posts: Observable<Post[]> = of([]);
    public router = inject(Router);

    ngOnInit() {
        this.posts = this.postService.getRejectedPosts()
    }
    
    navigateToEditMenu(post: Post) {
        this.postService.setSelectedPost(post);
        this.router.navigate(['/create-update']);
    }

}
