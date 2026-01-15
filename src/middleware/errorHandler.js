const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message || 'Erreur de validation' });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  res.status(500).json({ message: 'Une erreur est survenue' });
};

module.exports = { errorHandler };
