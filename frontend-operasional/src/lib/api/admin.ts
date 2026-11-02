import { usersApi, warehouseApi } from "./users";

export const adminApi = {
  getUsers: usersApi.getAllUsers,
  createUser: usersApi.createUser,
  createCourierStaff: usersApi.createCourierStaff,
  deleteUser: usersApi.remove,

  // Warehouse helpers for user creation
  getWarehouses: warehouseApi.getAll,
  findNearestWarehouses: warehouseApi.findNearest,
  getAllCouriersForSelection: usersApi.getAllCouriersForSelection,
  getActivityLogs: usersApi.getActivityLogs,

  // Seller + Courier Affiliation helpers
  createSellerWithCourier: usersApi.createSellerWithCourier,
  getSellerCourierAffiliations: usersApi.getSellerCourierAffiliations,
  updateSellerCourierAffiliation: usersApi.updateSellerCourierAffiliation,

  // Toggle Seller Status
  toggleSellerStatus: usersApi.toggleSellerStatus,
};
