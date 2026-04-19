const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
};

const limits = { fileSize: 5 * 1024 * 1024 };

function makeStorage(prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${prefix}-${req.session.userId}-${Date.now()}${ext}`);
    }
  });
}

const profileUpload = multer({ storage: makeStorage('user'), fileFilter, limits });
const postUpload    = multer({ storage: makeStorage('post'), fileFilter, limits });

module.exports = profileUpload;
module.exports.postUpload = postUpload;
