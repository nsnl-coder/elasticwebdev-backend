const pageNotFound = (req, res) => {
  res.status(404).json({
    message: 'The route is not defined yet',
  });
};

module.exports = pageNotFound;
