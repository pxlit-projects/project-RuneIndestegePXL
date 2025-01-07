export interface Post {
    id?: number;
    title: string;
    content: string;
    author?: string;
    createdAt?: Date;
    review?: string;
}

  export interface PostUpdate {
    title: string;
    content: string;
  }
/*
  export interface PostCreateOrUpdate {
    id? : number;
    title: string;
    content: string
   }
  */
  export interface PostSearchCriteria {
    author?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
  }

