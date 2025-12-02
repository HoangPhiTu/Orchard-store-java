import { useCallback } from "react";
import { uploadService } from "@/services/upload.service";
import { markImageForDeletion } from "@/services/image-deletion.service";
import {
  getImageFolder,
  generateImageFileName,
  type ImageEntityType,
} from "@/lib/image/image-utils";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

/**
 * Image Management Hook
 *
 * Reusable hook for handling image upload and deletion across all entities
 * Implements best practices from IMAGE_MANAGEMENT_STRATEGY.md
 *
 * Features:
 * - Date partitioning for folder structure
 * - Soft delete (mark for deletion)
 * - Error handling and cleanup
 *
 * @param entityType - Entity type (users, brands, categories, etc.)
 * @returns Image management functions
 */
export function useImageManagement(entityType: ImageEntityType) {
  /**
   * Upload image with date partitioning
   *
   * @param file - File to upload
   * @returns Image URL
   */
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      try {
        // Generate folder with date partitioning
        const folder = getImageFolder(entityType);

        // Upload image
        const imageUrl = await uploadService.uploadImage(file, folder);

        logger.debug(
          `Image uploaded successfully for ${entityType}:`,
          imageUrl
        );
        return imageUrl;
      } catch (error) {
        logger.error(`Failed to upload image for ${entityType}:`, error);
        throw error;
      }
    },
    [entityType]
  );

  /**
   * Mark image for deletion (soft delete)
   * Image will be deleted later by cleanup job
   *
   * @param imageUrl - Image URL to mark for deletion
   * @param entityId - Optional entity ID
   * @param reason - Reason for deletion
   */
  const markImageForDeletionSafe = useCallback(
    async (
      imageUrl: string | null | undefined,
      options?: {
        entityId?: number;
        reason?: "replaced" | "removed" | "entity_deleted" | "orphaned";
      }
    ): Promise<void> => {
      if (!imageUrl) return;

      try {
        await markImageForDeletion({
          imageUrl,
          entityType,
          entityId: options?.entityId,
          reason: options?.reason || "replaced",
        });

        logger.debug(`Image marked for deletion: ${imageUrl}`);
      } catch (error) {
        // Don't throw - just log warning
        // Image deletion is not critical for user flow
        logger.warn(`Failed to mark image for deletion: ${imageUrl}`, error);
        // Optionally show toast (non-blocking)
        // toast.warning("Không thể xóa ảnh cũ. Ảnh sẽ được dọn dẹp tự động sau.");
      }
    },
    [entityType]
  );

  /**
   * Handle image update with soft delete
   *
   * @param newImageUrl - New image URL (or File)
   * @param previousImageUrl - Previous image URL
   * @param entityId - Entity ID
   * @returns Final image URL
   */
  const handleImageUpdate = useCallback(
    async (
      newImageUrl: File | string | null | undefined,
      previousImageUrl: string | null | undefined,
      entityId?: number
    ): Promise<string | null> => {
      let finalImageUrl: string | null = null;

      // Upload new image if File provided
      if (newImageUrl instanceof File) {
        finalImageUrl = await uploadImage(newImageUrl);
      } else if (typeof newImageUrl === "string") {
        finalImageUrl = newImageUrl;
      } else {
        finalImageUrl = null;
      }

      // Mark old image for deletion (single call)
      if (previousImageUrl && finalImageUrl !== previousImageUrl) {
        // Có ảnh mới khác ảnh cũ -> REPLACED
        if (finalImageUrl) {
          await markImageForDeletionSafe(previousImageUrl, {
            entityId,
            reason: "replaced",
          });
        } else {
          // finalImageUrl null/undefined -> ảnh bị xóa hoàn toàn -> REMOVED
          await markImageForDeletionSafe(previousImageUrl, {
            entityId,
            reason: "removed",
          });
        }
      }

      return finalImageUrl;
    },
    [uploadImage, markImageForDeletionSafe]
  );

  /**
   * Cleanup uploaded image if operation fails
   *
   * @param imageUrl - Image URL to cleanup
   */
  const cleanupImage = useCallback(
    async (imageUrl: string | null | undefined): Promise<void> => {
      if (!imageUrl) return;

      try {
        await markImageForDeletionSafe(imageUrl, {
          reason: "orphaned",
        });
        logger.debug(`Image marked for cleanup: ${imageUrl}`);
      } catch (error) {
        logger.warn(`Failed to cleanup image: ${imageUrl}`, error);
      }
    },
    [markImageForDeletionSafe]
  );

  return {
    uploadImage,
    markImageForDeletion: markImageForDeletionSafe,
    handleImageUpdate,
    cleanupImage,
    getImageFolder: () => getImageFolder(entityType),
  };
}
