import http from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import { API_ROUTES } from "@/config/api-routes";

/**
 * Image Deletion Service
 * 
 * Service để quản lý soft delete của images
 * Implements soft delete strategy from IMAGE_MANAGEMENT_STRATEGY.md
 */

export interface MarkImageForDeletionRequest {
  imageUrl: string;
  entityType: string;
  entityId?: number;
  reason: "replaced" | "removed" | "entity_deleted" | "orphaned";
}

export interface MarkImageForDeletionResponse {
  id: number;
  imageUrl: string;
  markedAt: string;
}

/**
 * Mark image for deletion (soft delete)
 * Image will be deleted later by cleanup job
 * 
 * @param request - Deletion request
 * @returns Deletion queue record
 */
export async function markImageForDeletion(
  request: MarkImageForDeletionRequest
): Promise<MarkImageForDeletionResponse> {
  try {
    const response = await http.post<ApiResponse<MarkImageForDeletionResponse>>(
      `${API_ROUTES.UPLOAD}/mark-for-deletion`,
      request
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to mark image for deletion");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Mark multiple images for deletion
 * 
 * @param requests - Array of deletion requests
 * @returns Array of deletion queue records
 */
export async function markImagesForDeletion(
  requests: MarkImageForDeletionRequest[]
): Promise<MarkImageForDeletionResponse[]> {
  try {
    const response = await http.post<ApiResponse<MarkImageForDeletionResponse[]>>(
      `${API_ROUTES.UPLOAD}/mark-for-deletion/batch`,
      { images: requests }
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to mark images for deletion");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Image Deletion Service (for backward compatibility)
 * 
 * @deprecated Use markImageForDeletion instead for soft delete
 * This will be kept for direct deletion if needed
 */
export const imageDeletionService = {
  markForDeletion: markImageForDeletion,
  markBatchForDeletion: markImagesForDeletion,
};

