const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("heloo");
});

module.exports = router;