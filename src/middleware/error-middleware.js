const errorMiddleware = (err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "There was a server error" });
};

module.exports = errorMiddleware;
