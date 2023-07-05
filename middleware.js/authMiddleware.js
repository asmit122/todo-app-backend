const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    return res.status(400).redirect("/login");
  }
};

module.exports = { isAuth };
