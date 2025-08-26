const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ error: message });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    const message = `${field} already exists`;
    return res.status(400).json({ error: message });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || "Something went wrong!",
  });
};

module.exports = errorHandler;
