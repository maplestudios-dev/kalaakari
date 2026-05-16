export const notFound = (req, res) => res.status(404).json({ error: 'Not found', path: req.path })

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || (err.name === 'ValidationError' ? 422 : 500)
  // eslint-disable-next-line no-console
  if (status >= 500) console.error(err)
  res.status(status).json({ error: err.message || 'Server error' })
}
