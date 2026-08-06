export const notFound = (req, res) => res.status(404).json({ error: 'Not found', path: req.path })

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

export const errorHandler = (err, req, res, _next) => {
  // body-parser's bare "request entity too large" says nothing useful — name the
  // limit that was hit and how far over the request was.
  if (err.type === 'entity.too.large') {
    const over = err.length ? `The request is ${mb(err.length)}` : 'The request'
    return res.status(413).json({
      error: `Upload too large. ${over}, and this endpoint accepts up to ${mb(err.limit)}.`
    })
  }

  // Routes throughout the API signal intent with `res.status(409); throw ...`,
  // which this handler used to discard — every one of those came back as a 500
  // carrying the right message under the wrong code. Honour an already-set
  // status before falling back.
  const fromRes = res.statusCode >= 400 ? res.statusCode : 0
  const status = err.status || fromRes || (err.name === 'ValidationError' ? 422 : 500)
  // eslint-disable-next-line no-console
  if (status >= 500) console.error(err)
  res.status(status).json({ error: err.message || 'Server error' })
}
