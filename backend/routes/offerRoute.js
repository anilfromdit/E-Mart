const express = require("express");
const {
  getAllOffers,
  createOffer,
  deleteOffer,
} = require("../controllers/offersController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/offers").get(getAllOffers);
router
  .route("/admin/newOffer")
  .post(isAuthenticatedUser, authorizedRoles("admin"), createOffer);
router
  .route("/admin/offer/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOffer);

module.exports = router;
