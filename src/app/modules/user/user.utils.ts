import { User } from "../../generated/prisma/client";


export const removeSensitiveFields = (user: Partial<User>) => {
  const sensitiveFields = ["password", "refreshToken", "resetToken", "verificationToken"];
  sensitiveFields.forEach((field) => delete (user as any)[field]);
  return user;
};

export const sanitizeUserResponse = (user: User) => {
  return removeSensitiveFields({ ...user });
};

export const formatUserProfile = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    bio: user.bio,
    socialLinks: user.socialLinks,
    credits: user.credits,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const UserUtils = {
  removeSensitiveFields,
  sanitizeUserResponse,
  formatUserProfile,
};
