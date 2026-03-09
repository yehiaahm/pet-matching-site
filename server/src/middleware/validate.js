export const validate = ({ body, params, query }) => (req, res, next) => {
  if (body) {
    const parsed = body.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = parsed.data;
  }

  if (params) {
    const parsed = params.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.params = parsed.data;
  }

  if (query) {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    if (req.query && typeof req.query === 'object') {
      Object.keys(req.query).forEach((key) => {
        delete req.query[key];
      });
      Object.assign(req.query, parsed.data);
    }
  }

  next();
};
