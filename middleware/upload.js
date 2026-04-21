const multer = require('multer');
const path = require('path');

/* ========================================
   FILE TYPE FILTER
   Only allows common image formats;
   non-image uploads are silently rejected
   ======================================== */
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Image must be under 5MB and in JPG, PNG, or GIF format.'), false);
  }
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

/* ========================================
   HANDLE IMAGE UPLOAD
   Wraps a multer single-file upload with
   user-friendly error handling; on failure
   flashes an error and redirects back
   ======================================== */
function handleImageUpload(field) {
  const upload = postUpload.single(field);
  return (req, res, next) => {
    upload(req, res, err => {
      if (err) {
        req.flash('error', 'Image must be under 5MB and in JPG, PNG, or GIF format.');
        return res.redirect('back');
      }
      next();
    });
  };
}

module.exports = profileUpload;
module.exports.postUpload = postUpload;
module.exports.handleImageUpload = handleImageUpload;
