function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    address: user.address,
    phone: user.phone,
    gender: user.gender,
  };
}

module.exports = { serializeUser };
