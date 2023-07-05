const AccessModel = require("../models/AccessModel");

const rateLimiting = async (req, res, next) => {
  const sessionId = req.session.id;

  console.log(sessionId);

  if (!sessionId) {
    return res.send({
      status: 400,
      message: "Invalid Session. Please login.",
    });
  }

  // Ratelimit logic

  //Check is user has access recently
  const sessionDb = await AccessModel.findOne({ sessionId: sessionId });

  console.log(sessionDb);
  if (!sessionDb) {
    //create the entry in the access model

    const accessTime = new AccessModel({
      sessionId: sessionId,
      time: Date.now(),
    });

    await accessTime.save();
    next();
    return;
  }

  //if entry was there, then compare the time of req and sessionDb.time

  const previousAccessTime = sessionDb.time;
  const currentTime = Date.now();

  console.log((currentTime - previousAccessTime) / (1000 * 60));

  if (currentTime - previousAccessTime < 2000) {
    return res.send({
      status: 401,
      message: "Too many request, Please try in some time.",
    });
  }

  //allow the person to make the request by updating the previousAccess to currenttime

  try {
    await AccessModel.findOneAndUpdate(
      { sessionId: sessionId },
      { time: Date.now() }
    );
    next();
  } catch (error) {
    return res.send({
      status: 400,
      message: "database error",
      error: error,
    });
  }
};

module.exports = rateLimiting;
