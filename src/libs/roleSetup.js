import { roleModel } from "../dao/Mongoose/models/RoleSchema.js";
export const createRoles = async () => {
  try {
    const count = await roleModel.estimatedDocumentCount();
    if (count > 0) return;

    const values = await Promise.all([
      roleModel.create({ name: "admin" }),
      roleModel.create({ name: "user" }),
    ]);
  } catch (error) {
    console.log(error)
  }
};