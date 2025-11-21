import http from "@/lib/axios-client";

interface UploadResponse {
  url: string;
  path: string;
}

export const uploadService = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await http.post<UploadResponse>('/api/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  },
};
