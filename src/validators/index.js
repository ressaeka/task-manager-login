// VALIDASI Register dan Login 
export const validateUsernamePassword = ({ username, password }) => {
  if (!username || !password) {
    throw new Error("Username dan Password wajib diisi");
  }

  if (username.length < 3) {
    throw new Error("Username minimal 3 karakter");
  }

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-]).+$/;

  if (!regex.test(password)) {
    throw new Error("Password harus ada huruf besar, kecil, angka dan simbol");
  }
};

// VALIDASI TASK
export const validateTask = ({ title, description }) => {
    if (!title) {
        throw new Error("title harus diisi");
    }
    
    if (title.length < 5) {
        throw new Error("title minimal 5 karakter");
    }
    
    if (description && description.length > 255) {
        throw new Error("description maksimal 255 karakter");
    }
};

// VALIDASI UPDATE TASK
export const validateUpdateTask = ({ title, description, status }) => {
    if (title !== undefined && title.trim() === "") {
        throw new Error("title tidak boleh kosong.");
    }
    
    if (description !== undefined && description.length > 255) {
        throw new Error("description maksimal 255 karakter");
    }
    
    if (status !== undefined && !["pending", "in-progress", "done"].includes(status)) {
        throw new Error("status harus 'pending', 'in-progress', atau 'done'");
    }
};

export const validateAdmin = validateUsernamePassword;
export const validateAuth = validateUsernamePassword;
export const validateUser = validateUsernamePassword;