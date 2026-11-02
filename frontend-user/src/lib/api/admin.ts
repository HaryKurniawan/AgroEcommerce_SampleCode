import { usersApi, warehouseApi } from "./users";

export const adminApi = {
  getUsers: usersApi.getAllUsers,
  createUser: usersApi.createUser,
  createCourierStaff: usersApi.createCourierStaff,
  deleteUser: usersApi.remove,

  // Warehouse helpers for user creation
  getWarehouses: warehouseApi.getAll,
  findNearestWarehouses: warehouseApi.findNearest,
};
