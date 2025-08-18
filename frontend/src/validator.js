export function validateUser(user) {
  if (!user.username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
    throw new Error("Invalid username, it should contain only alphanumeric and underscore of length from 3 to 20.");
  }
  if (!user.password || user.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  return user;
}

export function validateEmail(email) {
  // Simple RFC 5322 compliant pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }
  return email;
}
