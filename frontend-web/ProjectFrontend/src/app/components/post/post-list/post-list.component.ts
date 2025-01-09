import { Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { Router } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { FilterComponent } from '../../filter/filter.component';
import { Filter } from '../../../models/filter.model';

@Component({
    selector: 'app-post-list',
    standalone: true,
    imports: [PostComponent, FilterComponent],
    templateUrl: './post-list.component.html',
    styleUrl: './post-list.component.css'
})
export class PostListComponent implements OnInit {
    public postService = inject(PostService);
    public posts!: Post[];
    public filteredData!: Post[];
    public router = inject(Router);

    ngOnInit() {
        this.postService.getPublishedPosts().subscribe(posts => {
            this.posts = posts;
            this.filteredData = posts; 
        });
    }

    navigateToComments(post: Post) {
        //this.postService.setSelectedPost(post);
        this.router.navigate(['/post-comments', post.id]);
    }

    handleFilter(filter: Filter){
        this.filteredData = this.posts.filter(post => this.isPostMatchingFilter(post, filter));
    }
       
    private isPostMatchingFilter(post: Post, filter: Filter): boolean {
        const matchesAuthor = filter.author ? post.author!.toLowerCase().includes(filter.author) : true;
        const matchesContent = filter.content ? post.content.toLowerCase().includes(filter.content) : true;
        const postDate = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt!);
    
        const matchesStartDate = filter.startDate 
        ? postDate.getTime() >= filter.startDate.getTime() 
        : true;
    
    const matchesEndDate = filter.endDate 
        ? postDate.getTime() <= filter.endDate.getTime() 
        : true;
        return matchesAuthor && matchesContent && matchesStartDate && matchesEndDate;
    }
}
