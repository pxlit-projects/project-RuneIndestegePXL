import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Post } from '../../../models/post.model';
import { PostService } from '../../../services/post.service';
import { AsyncPipe } from '@angular/common';  
import { PostComponent } from '../post/post.component';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-approved-list',
  standalone: true,
  imports: [AsyncPipe, PostComponent, MatIcon],
  templateUrl: './approved-list.component.html',
  styleUrls: ['./approved-list.component.css']
})
export class ApprovedListComponent implements OnInit {

  public postService = inject(PostService);
    public posts: Observable<Post[]> = of([]);
    public router = inject(Router);

    ngOnInit() {
        this.posts = this.postService.getApprovedPosts()
    }

    publishPost(id: number) {
        this.postService.publishPost(id).subscribe(() => {
            this.router.navigate(['/posts']);
        });
    }
}
