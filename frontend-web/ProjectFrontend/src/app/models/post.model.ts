export interface Post {
    id?: number;
    title: string;
    content: string;
    author: string;
    status: 'DRAFT' | 'PUBLISHED';
  }

  export interface PostUpdate {
    title?: string;
    content?: string;
  }
  
  export interface PostSearchCriteria {
    author?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
  }