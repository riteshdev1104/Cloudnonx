const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));
app.use(express.static('public'));
app.use(express.json());

cloudinary.config({
  cloud_name: "dlyrnzcvx",
  api_key: "888159357559569",
  api_secret: "PN0qq-UbSht89s75I48iqWEOanU",
});

const UPLOADS_JSON = 'uploads.json';
if (!fs.existsSync(UPLOADS_JSON)) fs.writeFileSync(UPLOADS_JSON, '[]');

// Basic Auth middleware
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== "Bearer uploader123") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.post('/upload', async (req, res) => {
  try {
    const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
    const uploaded = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "auto"
      });

      const entry = {
        url: result.secure_url,
        download: result.secure_url + "?fl_attachment",
        type: result.resource_type,
        format: result.format,
        public_id: result.public_id,
        created_at: new Date().toISOString()
      };

      uploaded.push(entry);

      const existing = JSON.parse(fs.readFileSync(UPLOADS_JSON));
      existing.unshift(entry);
      fs.writeFileSync(UPLOADS_JSON, JSON.stringify(existing, null, 2));
    }

    res.json({ uploaded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/uploads', (req, res) => {
  const data = JSON.parse(fs.readFileSync(UPLOADS_JSON));
  res.json(data);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});