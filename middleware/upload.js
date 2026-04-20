const multer = require('multer');
const path = require('path');

/* ========================================
   FILE TYPE FILTER
   Only allows common image formats;
   non-image uploads are silently rejected
   ======================================== */
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
};

/* ========================================
   FILE SIZE LIMIT
   5 MB cap applied to all uploads
   ======================================== */
const limits = { fileSize: 5 * 1024 * 1024 };

/* ========================================
   DISK STORAGE FACTORY
   Saves files to public/uploads/ with a
   prefix + userId + timestamp filename to
   prevent collisions between users
   ======================================== */
function makeStorage(prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${prefix}-${req.session.userId}-${Date.now()}${ext}`);
    }
  });
}

/* ========================================
   UPLOAD INSTANCES
   profileUpload — for user profile pictures
   postUpload    — for post banner images
   Both are exported so route files can
   apply the correct uploader
   ======================================== */
const profileUpload = multer({ storage: makeStorage('user'), fileFilter, limits });
const postUpload    = multer({ storage: makeStorage('post'), fileFilter, limits });

module.exports = profileUpload;
module.exports.postUpload = postUpload;
