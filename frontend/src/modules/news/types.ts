export interface NewsComment {
  id: string
  postId: string
  author: string
  content: string
  createdAt: string
}

export interface NewsPost {
  id: string
  author: string
  content: string
  createdAt: string
  campaign?: string
  comments: NewsComment[]
}
