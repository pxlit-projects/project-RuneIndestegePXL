export interface Review {
    id: number;
    review: string | null;
    title: string;
    content: string;
    author: string;
    postId: number;
    approved: boolean | null;
}