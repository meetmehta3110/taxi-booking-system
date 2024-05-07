import express, { Router } from "express";
const router: Router = express.Router();
import dotenv from "dotenv";
import { server_log } from "../../../../constants/constant";
dotenv.config({ path: "../../../../../../../env/.env" });

if (!process.env.DEFAULT_IMAGE_FOLDER) {
  throw new Error(
    `DEFAULT_IMAGE_FOLDER  ${server_log.Environment_variable_is_not_defined}`
  );
}
const DEFAULT_IMAGE_FOLDER = process.env.DEFAULT_IMAGE_FOLDER;

router.get("/:id", (req, res) => {
  const path = require("path");
  const imagePath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    DEFAULT_IMAGE_FOLDER,
    req.params.id
  );

  res.sendFile(imagePath);
});

export default router;
