const protected = (req, res, next) => {
  if (!req.user) return res.status(401).json();
  else return next();
};

const adminProtected = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) return res.status(401).json();
  else return next();
};

module.exports = {
  protected,
  adminProtected
};
