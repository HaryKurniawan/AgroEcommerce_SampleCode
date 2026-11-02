import { apiClient } from "../api-client";

export const reviewsApi = {
  /** Submit a review for a specific order item (1 per item) */
  createReview: (data: {
    orderItemId: string;
    rating: number;
    ulasan?: string;
  }) =>
    apiClient.post("/ulasan", {
      itemPesananId: data.orderItemId,
      rating: data.rating,
      ulasan: data.ulasan,
    }),

  /** Get all reviews for a product (Public) */
  getProductReviews: (
    produkId: string,
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
      sortBy?: string;
    },
  ) => apiClient.get(`/ulasan/produk/${produkId}`, { params }),

  /** Get all reviews for a product (Seller view) */
  getProductReviewsForSeller: (
    produkId: string,
    params?: { page?: number; limit?: number },
  ) => apiClient.get(`/ulasan/penjual/produk/${produkId}`, { params }),

  /** Report a review (Seller) */
  reportReview: (id: string, alasan: string) =>
    apiClient.post(`/ulasan/${id}/report`, { alasan }),

  /** Get review status for each item in an order */
  getOrderReviewStatus: (orderId: string) =>
    apiClient.get(`/ulasan/pesanan/${orderId}/status`),

  /** ADMIN METHODS */
  adminGetAllReviews: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => apiClient.get("/ulasan/admin/all", { params }),
  adminGetProductReviews: (
    produkId: string,
    params?: { page?: number; limit?: number },
  ) => apiClient.get(`/ulasan/produk/${produkId}`, { params }),
  adminGetReported: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => apiClient.get("/ulasan/admin/reported", { params }),
  adminTakedown: (id: string) =>
    apiClient.patch(`/ulasan/admin/${id}/approve-takedown`),
  adminRejectTakedown: (id: string) =>
    apiClient.patch(`/ulasan/admin/${id}/reject-takedown`),

  /** SELLER METHODS */
  getSellerReviews: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/ulasan/penjual/all", { params }),
};
