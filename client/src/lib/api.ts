
import { apiRequest } from './queryClient';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export async function fetchGallery(id: string) {
  const res = await apiRequest('GET', `/api/galleries/${id}`);
  return res.json();
}

export async function fetchGalleryArtworks(id: string) {
  const res = await apiRequest('GET', `/api/galleries/${id}/artworks`);
  return res.json();
}

export async function addArtworkToGallery(galleryId: string, artworkId: number) {
  const res = await apiRequest('POST', `/api/galleries/${galleryId}/artworks`, { artworkId });
  return res.json();
}

export async function removeArtworkFromGallery(galleryId: string, artworkId: number) {
  const res = await apiRequest('DELETE', `/api/galleries/${galleryId}/artworks/${artworkId}`);
  return res.json();
}
