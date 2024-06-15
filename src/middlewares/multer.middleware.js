import multer from 'multer';    

const storage = multer.diskStorage({          // Multer config
    destination: (req, file, cb) => {
        cb(null, ".public/temp")    // File destination
    },
        filename: function(req, file, cb)  {  // File name config
            
            cb(null, file.originalname)
        }
    }
);

const upload = multer({ storage: storage });

export default upload;