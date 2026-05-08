import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/ckeckAuth";
import { UserRole } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";

const router = Router();

// Current user routes
router.get(
  "/me",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  UserController.getMe
);

router.patch(
  "/me",
  checkAuth(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN),
  validateRequest(UserValidation.updateMeSchema),
  UserController.updateMe
);

// Admin/Manager routes
router.get(
  "/",
  checkAuth(UserRole.MANAGER, UserRole.ADMIN),
  UserController.getAllUsers
);

router.get(
  "/:id",
  checkAuth(UserRole.MANAGER, UserRole.ADMIN),
  UserController.getSingleUser
);

// Admin only routes
router.patch(
  "/:id/role",
  checkAuth(UserRole.ADMIN),
  validateRequest(UserValidation.updateRoleSchema),
  UserController.updateRole
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  UserController.deleteUser
);

export const userRoutes = router;
