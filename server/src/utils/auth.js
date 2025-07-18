import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id, // ✅ ADD THIS
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


export const formatUserResponse = (user) => {
  const response = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    skills: user.skills,
  };

  if (user.role === "worker") {
    response.profession = user.profession;
    response.experience = user.experience;
    response.hourlyRate = user.hourlyRate;
    response.location = user.location;
    response.bio = user.bio;
    response.averageRating = user.averageRating;
    response.totalRatings = user.totalRatings;
  }

  return response;
};
