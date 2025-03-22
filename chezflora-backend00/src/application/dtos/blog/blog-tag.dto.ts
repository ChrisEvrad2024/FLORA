// src/application/dtos/blog/blog-tag.dto.ts
export interface BlogTagDto {
    name: string;
    slug?: string;
}

export interface BlogTagResponseDto extends BlogTagDto {
    id: string;
    postCount?: number;
    createdAt: Date;
    updatedAt: Date;
}