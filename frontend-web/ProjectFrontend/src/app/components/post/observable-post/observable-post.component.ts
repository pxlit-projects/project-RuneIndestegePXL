import { Component, Input } from '@angular/core';
import { Post } from '../../../models/post.model';
import { DatePipe, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-observable-post',
  standalone: true,
  imports: [DatePipe, AsyncPipe],
  templateUrl: './observable-post.component.html',
  styleUrls: ['./observable-post.component.css']
})
export class ObservablePostComponent {
  @Input() post!: Observable<Post>;

}
