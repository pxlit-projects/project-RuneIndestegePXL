import { Component, Input } from '@angular/core';
import { Post } from '../../../models/post.model';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-post',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  @Input() post!: Post ;
}
