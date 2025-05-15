const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

const app = express();
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));
app.use(express.static('public'));

cloudinary.config({
  cloud_name: "dlyrnzcvx",
  api_key: "888159357559569",
  api_secret: "PN0qq-UbSht89s75I48iqWEOanU",
});

app.post('/upload', async (req, res) => {
  try {
    const file = req.files.file;
    const upload = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto"
    });
    res.json({
      secure_url: upload.secure_url,
      view_url: upload.secure_url,
      download_url: upload.secure_url + "?fl_attachment",
      type: upload.resource_type,
      format: upload.format,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});