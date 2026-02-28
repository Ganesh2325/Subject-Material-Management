export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const multerSizeError =
    err?.name === 'MulterError' && err?.code === 'LIMIT_FILE_SIZE';

  const statusCode =
    err?.statusCode ||
    (multerSizeError
      ? 413
      : res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500);

  res.status(statusCode);
  res.json({
    message:
      multerSizeError
        ? 'File too large. Maximum allowed size is 100MB.'
        : err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

