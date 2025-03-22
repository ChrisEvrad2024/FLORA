// src/application/dtos/blog/blog-tag.dto.ts
export interface BlogTagDto {
    id?: string;
    name: string;
    slug?: string;
}

export interface BlogTagResponseDto {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    postCount?: number;
}