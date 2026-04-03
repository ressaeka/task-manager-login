import bcrypt from "bcrypt";
import { customAlphabet } from "nanoid";
import { createUser, findUserByUsername, findUserById } from "../models/usersModel.js";
import { generateToken } from "../utils/jwt.js"; 

// REGISTER
export const registerService = async ({ username, password }) => {
  const existingUser = await findUserByUsername(username);

  if (existingUser) {
    throw new Error("User sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const nanoid = customAlphabet("ABCDEFGHIJKLMMNOPQRSTUVWXYZ0123456789");

  const newUser = await createUser({
    publicId: nanoid(10),
    username,
    password: hashedPassword,
    role: "user",
  });

  return newUser;
};

// LOGIN
export const loginService = async ({ username, password }) => {
  const user = await findUserByUsername(username);
  const isMatch = user && (await bcrypt.compare(password, user.password));

  if (!isMatch) {
    throw new Error("Username atau password salah");
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  return { token };
};

// GET USER
export const getUserProfileServices = async (id) => {
  const user = await findUserById(id);

  if (!user) {
    throw new Error("User tidak ditemukan");
  } 

  return user
};
