export interface Auth {
    user?: {
        firstName: string;
        lastName: string;
        avatarId: number;
    };
    accessToken?: string;
};

export interface Post {
  id: number;
  title: string;
  description: string;
  content: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  ratingCount: number;
  reportCount: number;
  authorId: string;
  author: {firstName: string, lastName: string}
}