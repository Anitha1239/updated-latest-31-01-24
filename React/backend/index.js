const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const nodemailer = require("nodemailer");
const { connection } = require("./connect.js");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const session = require("express-session");
const { checkUserToken } = require("./middleware/authentication.js");
// importing routes

const dotenv = require("dotenv");
// const fileUpload = require('express-fileupload')

dotenv.config();



app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  session({
    secret: "your-secret-key", // Change this to a strong, secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production if using HTTPS
  })
);


app.use(express.json());
app.use(
  cors({
    origin: "http://192.168.30.118:3000",
  })
);
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const handleDatabaseError = (err, res, message) => {
  console.error(message, err);
  return res.status(500).json({ error: "Internal Server Error" });
};

// signup
app.post("/signup", async (req, res) => {
  const { username, email, mobile, password } = req.body;

  try {
    // Check if the email already exists in the database
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(
      checkEmailQuery,
      [email],
      async (emailErr, emailResults) => {
        if (emailErr) {
          console.error("Error checking email:", emailErr);
          return res
            .status(500)
            .json({ success: false, message: "Error checking email" });
        }

        if (emailResults.length > 0) {
          // If email already exists, return an error message
          return res
            .status(400)
            .json({ success: false, message: "Email already exists" });
        }

        // Check if the mobile number already exists in the database
        const checkMobileQuery = "SELECT * FROM users WHERE mobile = ?";
        connection.query(
          checkMobileQuery,
          [mobile],
          async (mobileErr, mobileResults) => {
            if (mobileErr) {
              console.error("Error checking mobile:", mobileErr);
              return res
                .status(500)
                .json({ success: false, message: "Error checking mobile" });
            }

            if (mobileResults.length > 0) {
              // If mobile number already exists, return an error message
              return res
                .status(400)
                .json({
                  success: false,
                  message: "Mobile number already exists",
                });
            }

            // Check if the password or mobile number format is incorrect
            const isValidMobile = /^\d{10}$/.test(mobile); // Validate 10 digits for mobile number
            if (!isValidMobile) {
              return res
                .status(400)
                .json({
                  success: false,
                  message: "Mobile number should be 10 digits only",
                });
            }

            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

            // Insert the hashed password into the database
            const INSERT_USER_QUERY =
              "INSERT INTO users (username, email, mobile, password) VALUES (?, ?, ?, ?)";
            connection.query(
              INSERT_USER_QUERY,
              [username, email, mobile, hashedPassword],
              (err, userResults) => {
                if (err) {
                  console.error("Error creating user:", err);
                  return res
                    .status(500)
                    .json({ success: false, message: "Error creating user" });
                }

                const userId = userResults.insertId;
                const INSERT_PROFILE_QUERY = `
              INSERT INTO newprofiles (name, isChildProfile, pin, userId, profilePhotoPath)
              SELECT ?, ?, ?, ?, ? 
              FROM dual
              WHERE EXISTS (SELECT * FROM users WHERE id = ?)
            `;

                // Use username for both 'name' in newprofiles and 'username' in users table
                const profileData = {
                  name: username, // Use username as 'name' in newprofiles table
                  isChildProfile: req.body.isChildProfile || 0,
                  pin: req.body.pin || null,
                  userId: userId,
                  profilePhotoPath: req.body.profilePhotoPath || null,
                };

                connection.query(
                  INSERT_PROFILE_QUERY,
                  [
                    profileData.name,
                    profileData.isChildProfile,
                    profileData.pin,
                    profileData.userId,
                    profileData.profilePhotoPath,
                    profileData.userId,
                  ],
                  (profileErr) => {
                    if (profileErr) {
                      console.error("Error creating profile:", profileErr);
                      return res
                        .status(500)
                        .json({
                          success: false,
                          message: "Error creating profile",
                        });
                    }

                    // Sending welcome email
                    const transporter = nodemailer.createTransport({
                      service: "gmail",
                      auth: {
                        user: "realmdefend@gmail.com", // Replace with your email address
                        pass: "hzictfxkvagjvodi", // Replace with your email password or app-specific password
                      },
                    });

                    const mailOptions = {
                      from: "realmdefend@gmail.com",
                      to: email,
                      subject: "Welcome to our platform!",
                      text: `Dear ${username},\nThank you for signing up! Welcome to our platform.`,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        console.error("Error sending email:", error);
                        // Handle error (e.g., inform the user about email sending failure)
                      } else {
                        console.log("Email sent:", info.response);
                        // Email sent successfully (you can add any additional logic here)
                      }
                    });

                    res
                      .status(200)
                      .json({
                        success: true,
                        message: "User and profile created successfully",
                      });
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ success: false, message: "Error during signup process" });
  }
});



// signin
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const FIND_USER_QUERY = "SELECT * FROM users WHERE email = ?";
    connection.query(FIND_USER_QUERY, [email], async (err, results) => {
      if (err) {
        console.error("Error finding user:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error finding user" });
      }

      if (results.length > 0) {
        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          // Send the userData along with the response
          const timestamp = Date.now();

          const token = jwt.sign(
            { id: results[0].id, timestamp },
            process.env.JWT_SECRET || "secretkey"
          );
          res.cookie("accessToken", token, {
            httpOnly: true,
          });
          const { password, ...others } = results[0];

          return res.status(200).json(others);
        } else {
          return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
        }
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    });
  } catch (error) {
    console.error("Error during signin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error during signin" });
  }
});

// .....................................

// forgotpassword

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "realmdefend@gmail.com", // Replace with your email address
    pass: "hzictfxkvagjvodi", // Replace with your email password or app-specific password
  },
});

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

// Temporary storage for email during password reset
let emailForPasswordReset = "";

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();

    // Store the email temporarily for password reset
    emailForPasswordReset = email;

    // Check if the email exists in the users table
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        console.error("Error checking email:", err);
        return res.status(500).json({ message: "Error checking email" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Email not found. Please sign up." });
      }

      // Create the otp_storage table if it doesn't exist
      const createOTPTableQuery = `
        CREATE TABLE IF NOT EXISTS otp_storage (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(10) NOT NULL
        )
      `;
      connection.query(createOTPTableQuery, (tableErr, tableResult) => {
        if (tableErr) {
          console.error("Error creating otp_storage table:", tableErr);
          return res
            .status(500)
            .json({ message: "Error creating otp_storage table" });
        }

        // Insert the email and OTP into the otp_storage table
        const insertOTPQuery =
          "INSERT INTO otp_storage (email, otp) VALUES (?, ?)";
        connection.query(
          insertOTPQuery,
          [email, otp],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting OTP:", insertErr);
              return res.status(500).json({ message: "Error inserting OTP" });
            }

            // Send email with OTP
            const mailOptions = {
              from: "realmdefend@gmail.com",
              to: email,
              subject: "Password Reset OTP",
              text: `Your OTP for password reset is: ${otp}`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error) {
                console.error("Error sending email:", error);
                return res
                  .status(500)
                  .json({ message: "Failed to send OTP. Please try again." });
              } else {
                console.log("Email sent");
                return res
                  .status(200)
                  .json({ message: "OTP sent successfully." });
              }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error in send-otp endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;

    // Retrieve the stored OTP for the provided email from the otp_storage table
    const getStoredOTPQuery = "SELECT * FROM otp_storage WHERE email = ?";

    // Use Promise to handle the database query
    const results = await new Promise((resolve, reject) => {
      connection.query(
        getStoredOTPQuery,
        [emailForPasswordReset],
        (err, results) => {
          if (err) {
            console.error("Error retrieving stored OTP:", err);
            reject(err); // Reject the Promise with the error
          } else {
            resolve(results); // Resolve the Promise with the query results
          }
        }
      );
    });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "OTP not found. Please try again." });
    }

    const storedOTP = results[0].otp;

    if (otp !== storedOTP) {
      return res
        .status(401)
        .json({ message: "Incorrect OTP. Please try again." });
    }

    // OTP matches, proceed with the password reset logic or other actions
    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error in verify-otp endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Check if emailForPasswordReset contains a stored email for password reset
    if (!emailForPasswordReset) {
      console.error("No email found for password reset");
      return res
        .status(400)
        .json({ message: "Email not provided for password reset." });
    }

    // Hash the new password before updating in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Using bcrypt for hashing

    // Proceed to update the hashed password in the users table for the stored email
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    connection.query(
      updatePasswordQuery,
      [hashedPassword, emailForPasswordReset],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res
            .status(500)
            .json({ message: "Failed to update password. Please try again." });
        }

        if (updateResult.affectedRows === 0) {
          console.error("Password update unsuccessful - Email not found");
          return res
            .status(404)
            .json({ message: "Email not found. Please sign up." });
        }

        console.log("Password updated successfully");

        // Clear the stored email after successful password update

        // Delete the stored OTP record after successful password update
        const deleteOTPQuery = "DELETE FROM otp_storage WHERE email = ?";

        connection.query(
          deleteOTPQuery,
          [emailForPasswordReset],
          (deleteErr, deleteResult) => {
            if (deleteErr) {
              console.error("Error deleting OTP record:", deleteErr);
              return res
                .status(500)
                .json({ message: "Error deleting OTP record" });
            }
            console.log("OTP record deleted");
            emailForPasswordReset = "";
            return res
              .status(200)
              .json({ message: "Password updated successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// fetching profiles
app.get("/profiles", checkUserToken, (req, res) => {
  const userID = req.userId; // Retrieve userID from request headers
  console.log("prabhas", userID);

  if (userID) {
    // Proceed with fetching profiles using userID
    const FETCH_PROFILES_QUERY = "SELECT * FROM newprofiles WHERE userId = ?";
    connection.query(FETCH_PROFILES_QUERY, [userID], (err, profiles) => {
      if (err) {
        console.error("Error fetching profiles:", err);
        res
          .status(500)
          .json({ success: false, message: "Error fetching profiles" });
      } else {
        console.log("Fetched profiles:", profiles);
        res.status(200).json({ success: true, profiles });
      }
    });
  } else {
    console.error("User ID not available");
    res.status(401).json({ success: false, message: "User ID not available" });
  }
});


app.get('/profiles/:profileId', checkUserToken, (req, res) => {
  const profileId = req.params.profileId;
 
  // Query to fetch profile details from the database, including PIN
  const query = 'SELECT * FROM newprofiles WHERE id = ? AND userId = ?';
  connection.query(query, [profileId, req.userId], (error, results) => {
    if (error) {
      console.error('Error fetching profile details:', error);
      res.status(500).json({ success: false, message: 'Error fetching profile details' });
      return;
    }
 
    if (results.length === 0) {
      res.status(404).json({ success: false, message: 'Profile not found or unauthorized' });
      return;
    }
 
    const profileDetails = results[0];
    res.status(200).json({ success: true, profile: profileDetails });
  });
});
// adding profiles

app.post('/profiles', checkUserToken, (req, res) => {
  const userId = req.userId;
  const { name, profilePhotoPath, pin } = req.body;
  // Check if the user has already reached the profile limit
  const checkLimitQuery = 'SELECT COUNT(id) AS profileCount FROM newprofiles WHERE userId = ?';
  connection.query(checkLimitQuery, [userId], (countError, countResults) => {
    if (countError) {
      console.error('Error checking profile count:', countError);
      res.status(500).json({ success: false, message: 'Error checking profile count' });
      return;
    }
    const profileCount = countResults[0].profileCount;
    if (profileCount >= 3) {
      res.status(403).json({ success: false, message: 'Profile limit reached. You cannot add more profiles.' });
      return;
    }
    // If the user has not reached the limit, proceed with profile creation
    const createProfileQuery = 'INSERT INTO newprofiles (userId, name, profilePhotoPath, pin) VALUES (?, ?, ?, ?)';
    connection.query(createProfileQuery, [userId, name, profilePhotoPath, pin], (error, results) => {
      if (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ success: false, message: 'Error creating profile' });
        return;
      }

      const profileId = results.insertId;
      res.status(201).json({ success: true, profileId });
    });
  });
});

app.post(
  "/add-profile",
  checkUserToken,
  upload.single("profilePhoto"),
  (req, res) => {
    const { name, isChildProfile, pin } = req.body;

    // Assuming 'isChildProfile' is a boolean value (true/false)
    // Assuming 'globalUserID' holds the user ID

    try {
      const profilePhotoPath = req.file ? req.file.path : null; // Get the uploaded file path

      const INSERT_PROFILE_QUERY =
        "INSERT INTO newprofiles (name, isChildProfile, pin, userId, profilePhotoPath) VALUES (?, ?, ?, ?, ?)";
      connection.query(
        INSERT_PROFILE_QUERY,
        [name, isChildProfile, pin, req.userId, profilePhotoPath],
        (err, result) => {
          if (err) {
            console.error("Error adding profile:", err);
            return res
              .status(500)
              .json({ success: false, message: "Error adding profile" });
          }

          console.log("Profile added successfully");
          res
            .status(200)
            .json({ success: true, message: "Profile added successfully" });
        }
      );
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ success: false, message: "Error adding profile" });
    }
  }
);

app.get("/profile-details/:profileId", checkUserToken, (req, res) => {
  const profileId = req.params.profileId;

  // Fetch the user's ID from the request
  const userId = req.userId;

  const query = `
    SELECT 
      np.*,
      (SELECT COUNT(id) FROM newprofiles WHERE userId = ? AND id <= np.id) as profileCount
    FROM newprofiles np
    WHERE np.id = ?
  `;

  connection.query(query, [userId, profileId], (error, results) => {
    if (error) {
      console.error("Error fetching profile details:", error);
      res.status(500).json({ success: false, message: "Error fetching profile details" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    const profileDetails = results[0];

    const isDeleteButtonDisabled = profileDetails.profileCount === 1;

    res.status(200).json({ success: true, profile: profileDetails, isDeleteButtonDisabled });
  });
});

// edit profile

app.put(
  "/edit-profile/:profileId",
  checkUserToken,
  upload.single("profilePhoto"),
  (req, res) => {
    const { name, isChildProfile, pin } = req.body;
    const profileId = req.params.profileId;

    try {
      const profilePhotoPath = req.file ? req.file.path : null; // Get the uploaded file path

      const UPDATE_PROFILE_QUERY =
        "UPDATE newprofiles SET name=?, isChildProfile=?, pin=?, profilePhotoPath=? WHERE id=? AND userId=?";
      connection.query(
        UPDATE_PROFILE_QUERY,
        [name, isChildProfile, pin, profilePhotoPath, profileId, req.userId],
        (err, result) => {
          if (err) {
            console.error("Error updating profile:", err);
            return res
              .status(500)
              .json({ success: false, message: "Error updating profile" });
          }

          if (result.affectedRows === 0) {
            return res
              .status(404)
              .json({
                success: false,
                message: "Profile not found or unauthorized",
              });
          }

          console.log("Profile updated successfully");
          res
            .status(200)
            .json({ success: true, message: "Profile updated successfully" });
        }
      );
    } catch (error) {
      console.error("Error:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Error updating profile" });
    }
  }
);


app.delete("/edit-profile/:profileId", checkUserToken, (req, res) => {
  const profileId = req.params.profileId;

  // Example query to delete the profile with the specified profileId
  const deleteProfileQuery = 'DELETE FROM newprofiles WHERE id = ? AND userId = ?';
  connection.query(deleteProfileQuery, [profileId, req.userId], (error, result) => {
    if (error) {
      console.error('Error deleting profile:', error);
      res.status(500).json({ success: false, message: 'Error deleting profile' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Profile not found or unauthorized' });
      return;
    }

    // Example query to delete data related to the deleted profile from movies_restrict table
    const deleteMoviesDataQuery = 'DELETE FROM movies_restrict WHERE profileId = ? AND userId = ?';
    connection.query(deleteMoviesDataQuery, [profileId, req.userId], (error, deleteMoviesResult) => {
      if (error) {
        console.error('Error deleting movies data:', error);
        res.status(500).json({ success: false, message: 'Error deleting movies data' });
        return;
      }

      // Example query to delete data related to the deleted profile from watchlist table
      const deleteWatchlistDataQuery = 'DELETE FROM watchlist WHERE profileId = ? AND userId = ?';
      connection.query(deleteWatchlistDataQuery, [profileId, req.userId], (error, deleteWatchlistResult) => {
        if (error) {
          console.error('Error deleting watchlist data:', error);
          res.status(500).json({ success: false, message: 'Error deleting watchlist data' });
          return;
        }

        console.log('Profile and related data deleted successfully');
        res.status(200).json({ success: true, message: 'Profile and related data deleted successfully' });
      });
    });
  });
});




app.post("/logout", (req, res) => {
  const cookiesToClear = ["accessToken", "userRole"]; // Add all your cookie names here

  cookiesToClear.forEach((cookieName) => {
    res.clearCookie(cookieName, {
      secure: true,
      sameSite: "none",
    });
  });

  res.status(200).json({ message: "User has been logged out." });
});

app.post(
  "/upload",
  upload.fields([{ name: "video" }, { name: "image" }]),
  (req, res) => {
    const videoPath = req.files["video"][0].path;
    const imagePath = req.files["image"][0].path;
    const { title, description, scheduledTime, genre, categories, ageRating } =
      req.body;

    const insertQuery = `
    INSERT INTO uploads
    (video_path, image_path, title, description, scheduled_time, upload_time, genre_id, categories, age_rating)
    VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
  `;
    connection.query(
      insertQuery,
      [
        videoPath,
        imagePath,
        title,
        description,
        scheduledTime,
        genre,
        categories,
        ageRating,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send("Error uploading files and saving data to the database.");
        }

        // Send response containing the image path for use in FileUpload.js
        return res.status(200).json({ imagePath: imagePath });
      }
    );
  }
);

app.get("/notifications", (req, res) => {
  const selectQuery = `
    SELECT id, title, age_rating, genre_id, categories, scheduled_time, upload_time, image_path
    FROM uploads
    ORDER BY id DESC
    LIMIT 5;
  `;
  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("Error fetching notifications from the database.");
    }
    return res.status(200).json(results);
  });
});

// Add this route to handle fetching movie details
// Backend


app.get("/getMovieDetailsSearch", (req, res) => {
  const profileId = req.query.profileId; // Get the profileId from the query parameters
  const selectQuery = `
    SELECT u.*
    FROM uploads u
    LEFT JOIN movies_restrict mr ON u.title = mr.movieTitle AND mr.profileId = ?
    WHERE mr.id IS NULL OR mr.id IS NULL
  `;

  connection.query(selectQuery, [profileId], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("Error fetching movie details from the database.");
    }

    if (result.length > 0) {
      return res.status(200).json(result); // Send the entire array of movies
    } else {
      return res.status(404).send("No movie details found.");
    }
  });
});


app.get("/getMovieDetails", (req, res) => {
  const profileId = req.query.profileId;
  console.log("Profile ID:", profileId); // Logging the profileId

  const selectQuery = `
    SELECT title, genre, description, image_path, video_path FROM uploads 
    WHERE title NOT IN (
      SELECT movieTitle FROM movies_restrict WHERE profileId = ?
    )
  `;

  connection.query(selectQuery, [profileId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching movie details from the database.");
    }

    if (result.length > 0) {
      console.log("Fetched movies:", result); // Logging the fetched movies

      // Extract only necessary information
      const movieDataToSend = result.map(movie => ({
        title: movie.title,
        genre: movie.genre,
        description: movie.description,
        imagePath: `http://192.168.30.118:8800/${movie.image_path}`
        // video_path is fetched but not sent to the frontend
      }));

      return res.status(200).json(movieDataToSend); // Sending the filtered movie details
    } else {
      return res.status(404).send("No movie details found for the given profile or all titles are restricted.");
    }
  });
});





app.get("/genres", (req, res) => {
  const selectQuery = `SELECT * FROM genres`;

  connection.query(selectQuery, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching genres from the database.");
    }
    return res.status(200).json(result);
  });
});


app.get("/saveProfileId/:profileId", (req, res) => {
  const { profileId } = req.params;

  // Save profileId in the session
  req.session.profileId = profileId;
  console.log(req.session.profileId);

  res
    .status(200)
    .json({ success: true, message: "ProfileId saved in session" });
});

app.get("/getMoviesByGenre/:genreId/:profileId", (req, res) => {
  const genreId = req.params.genreId;
  const profileId = req.params.profileId;
 

  // Assuming there's some form of authentication or session management to get profileId
  if (!profileId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const selectQuery = `
    SELECT uploads.*
    FROM uploads
    LEFT JOIN movies_restrict ON uploads.title = movies_restrict.movieTitle 
                              AND movies_restrict.profileId = ?
    WHERE uploads.genre_id = ? AND movies_restrict.profileId IS NULL
  `;

  connection.query(selectQuery, [profileId, genreId], (err, results) => {
    if (err) {
      console.error("Error fetching movies by genre:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Assuming results is an array of movies
    return res.status(200).json(results);
  });
});


app.get("/getMovieDetails/:id", (req, res) => {
  const movieId = req.params.id;
  const selectQuery = `SELECT * FROM uploads WHERE id = ?`;

  connection.query(selectQuery, [movieId], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("Error fetching movie details from the database.");
    }

    if (result.length > 0) {
      return res.status(200).json(result); // Send the movie details
    } else {
      return res.status(404).send("No movie details found.");
    }
  });
});

// restrict
app.get("/movie-titles", (req, res) => {
  connection.query("SELECT title FROM uploads", (err, results) => {
    if (err) {
      console.error("Error fetching movie titles:", err);
      res.status(500).json({ success: false, error: "Failed to fetch movie titles" });
      return;
    }
    const movieTitles = results.map((result) => result.title);
    res.status(200).json({ success: true, titles: movieTitles });
  });
});

// Endpoint to fetch restricted movies for a specific profile
app.get("/restricted-movies/:profileId", (req, res) => {
  const { profileId } = req.params;
  connection.query("SELECT movieTitle FROM movies_restrict WHERE profileId = ?", profileId, (err, results) => {
    if (err) {
      console.error("Error fetching restricted movies:", err);
      res.status(500).json({ success: false, error: "Failed to fetch restricted movies" });
      return;
    }
    const restrictedMovies = results.map((result) => result.movieTitle);
    res.status(200).json({ success: true, restrictedMovies });
  });
});

app.get("/genres-restrict", (req, res) => {
  const query = "SELECT genre FROM genres"; // Assuming 'genres' table contains genre names

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ success: false, error: "Failed to fetch genres" });
    } else {
      const genres = results.map((result) => result.genre);
      res.status(200).json({ success: true, genres: genres });
    }
  });
});


app.post("/save-movies", checkUserToken, async (req, res) => {
  const { profileId, profileName, movieTitles } = req.body;
  const userId = req.userId;
  console.log("Received data:", {
    profileId,
    profileName,
    userId,
    movieTitles,
  });
  try {
    const insertQuery =
      "INSERT INTO movies_restrict (profileId, profileName, movieTitle, userId) VALUES (?, ?, ?, ?)";

    for (const title of movieTitles) {
      if (profileId && profileName && userId && title) {
        await connection.execute(insertQuery, [
          profileId,
          profileName,
          title,
          userId,
        ]);
      } else {
        // Handle the case where any of the required parameters is undefined or null
        throw new Error("Invalid parameters");
      }
    }

    console.log("Movies saved successfully");
    return res
      .status(200)
      .json({ success: true, message: "Movies saved successfully" });
  } catch (error) {
    console.error("Error saving movies:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to save movies" });
  }
});


app.get("/getVideoInfo/:videoPath", (req, res) => {
  const videoPath = req.params.videoPath;
  console.log("Video Path:", videoPath); // Logs the received videoPath parameter

  const selectQuery = `SELECT * FROM uploads WHERE video_path = ?`;

  // Execute the SQL query to fetch video details
  connection.query(selectQuery, [videoPath], (err, result) => {
    if (err) {
      console.log("Error executing query:", err);
      return res
        .status(500)
        .send("Error fetching video details from the database.");
    }

    console.log("Query Result:", result); // Logs the query result

    if (result.length > 0) {
      const videoInfo = {
        videoTitle: result[0].title,
        // Add other video details as needed from the query result
      };
      return res.status(200).json(videoInfo); // Responds with video details in JSON format
    } else {
      return res.status(404).send("Video not found."); // Handles case when video is not found
    }
  });
});





app.post('/addToWatchlist/:profileId', checkUserToken, (req, res) => {
  const { movieId, title, genre } = req.body;
  const userId = req.userId; // Retrieve userID from request headers
  const profileId = req.params.profileId; // Retrieve profileId from URL params

  if (!userId) {
    console.error('User not authenticated');
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Insert the received data into the 'watchlist' table including the userId and profileId
  const insertQuery = `INSERT INTO watchlist (userId, profileId, movieId, title ) VALUES ( ?, ?, ?, ?)`;
  connection.query(insertQuery, [userId, profileId, movieId, title, ], (insertError, insertResults) => {
    if (insertError) {
      console.error('Error inserting into the database:', insertError);
      return res.status(500).json({ error: 'Failed to add movie to watchlist' });
    }
    console.log('Movie added to watchlist');
    res.status(200).json({ message: 'Movie added to watchlist successfully' });
  });
});



app.delete('/removeFromWatchlist/:profileId/:movieId', checkUserToken, (req, res) => {
  const { movieId } = req.params;
  const userId = req.userId; // Retrieve userID from request headers
  const profileId = req.params.profileId; // Retrieve profileId from URL params

  if (!userId) {
    console.error('User not authenticated');
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Delete the movie from the 'watchlist' table based on movieId, userId, and profileId
  const deleteQuery = 'DELETE FROM watchlist WHERE userId = ? AND profileId = ? AND movieId = ?';
  connection.query(deleteQuery, [userId, profileId, movieId], (deleteError, deleteResults) => {
    if (deleteError) {
      console.error('Error deleting from the database:', deleteError);
      return res.status(500).json({ error: 'Failed to remove movie from watchlist' });
    }
    if (deleteResults.affectedRows === 0) {
      console.log('Watchlist item not found');
      return res.status(404).json({ error: 'Watchlist item not found' });
    }
    console.log('Movie removed from watchlist');
    res.status(200).json({ success: true, message: 'Movie removed from watchlist successfully' });
  });
});

app.get('/watchlist/:profileId', checkUserToken, (req, res) => {
  const profileId = req.params.profileId;
  
  try {
    // Fetch watchlist videos based on the current profileId by joining uploads and watchlist tables
    const query = `
      SELECT w.movieId, u.title AS uploadTitle, u.video_path, u.image_path
      FROM watchlist w
      JOIN uploads u ON w.movieId = u.id
      WHERE w.profileId = ?
    `;

    connection.query(query, [profileId], (error, results) => {
      if (error) {
        console.error('Error fetching watchlist videos:', error);
        res.status(500).json({ success: false, message: 'Error fetching watchlist videos' });
      } else {
        res.status(200).json({ success: true, watchlist: results });
      }
    });
  } catch (error) {
    console.error('Error in fetching watchlist:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get("/getGenreName/:genreId", (req, res) => {
  const genreId = req.params.genreId;
  const selectQuery = `
    SELECT genre FROM genres
    WHERE id = ?
  `;

  connection.query(selectQuery, [genreId], (err, results) => {
    if (err) {
      console.error("Error fetching genre name:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Assuming results is an array with a single item containing genreName
    const genreName = results[0] ? results[0].genre : "Unknown Genre";
    return res.status(200).json({ genreName });
  });
});

app.get("/getMoviesByGenreOne/:genreId", (req, res) => {
  const genreId = req.params.genreId;
  console.log("753");
  const profileId = req.session.profileId;
  console.log(profileId);
  console.log("755");
  const selectQuery = `
    SELECT * FROM uploads
    WHERE genre_id = ?
  `;

  connection.query(selectQuery, [genreId], (err, results) => {
    if (err) {
      console.error("Error fetching movies by genre:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Assuming results is an array of movies
    return res.status(200).json(results);
  });
});








// Start the server

// New route to handle fetching child-friendly movies
app.get("/getChildFriendlyMovies", (req, res) => {
  const selectQuery = `
    SELECT * FROM uploads
    WHERE age_rating <= 13 
  `;

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching child-friendly movies:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(results);
  });
});


// New route to handle fetching child-friendly notifications
app.get("/child-notification", (req, res) => {
  const selectQuery = `
    SELECT id, title, age_rating, genre_id, categories, scheduled_time, upload_time, image_path
    FROM uploads
    WHERE age_rating <= 13 OR age_rating IS NULL
    ORDER BY id DESC
    LIMIT 5;
  `;

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching child notifications:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(results);
  });
});



app.get('/child/watchlist/:profileId', checkUserToken, (req, res) => {
  const profileId = req.params.profileId;

  try {
    // Fetch watchlist videos for child profile (age 13+)
    const query = `
      SELECT w.movieId, u.title AS uploadTitle, u.video_path, u.image_path
      FROM watchlist w
      JOIN uploads u ON w.movieId = u.id
      WHERE w.profileId = ? AND u.age_rating >= 13
    `;

    connection.query(query, [profileId], (error, results) => {
      if (error) {
        console.error('Error fetching child watchlist videos:', error);
        res.status(500).json({ success: false, message: 'Error fetching child watchlist videos' });
      } else {
        res.status(200).json({ success: true, watchlist: results });
      }
    });
  } catch (error) {
    console.error('Error in fetching child watchlist:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/child/addToWatchlist/:profileId/:movieId', checkUserToken, (req, res) => {
  const { profileId, movieId } = req.params;

  try {
    // Check if the movie is rated for 13+
    const ageQuery = 'SELECT age_rating FROM uploads WHERE id = ?';

    connection.query(ageQuery, [movieId], (ageError, ageResults) => {
      if (ageError) {
        console.error('Error checking age rating:', ageError);
        res.status(500).json({ success: false, message: 'Error checking age rating' });
      } else {
        const ageRating = ageResults[0].age_rating;

        if (ageRating >= 13) {
          // Add the movie to the watchlist
          const addToWatchlistQuery = 'INSERT INTO watchlist (profileId, movieId) VALUES (?, ?)';

          connection.query(addToWatchlistQuery, [profileId, movieId], (addError) => {
            if (addError) {
              console.error('Error adding to watchlist:', addError);
              res.status(500).json({ success: false, message: 'Error adding to watchlist' });
            } else {
              res.status(200).json({ success: true, message: 'Movie added to watchlist' });
            }
          });
        } else {
          res.status(403).json({ success: false, message: 'Movie is not suitable for children' });
        }
      }
    });

  } catch (error) {
    console.error('Error in adding to watchlist:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// --------------------

app.get('/movie-titles', (req, res) => {
  const query = 'SELECT title FROM uploads'; // Assuming the 'uploads' table contains the movie titles

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching movie titles:', err.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    } else {
      const movieTitles = results.map((result) => result.title);
      res.json({ success: true, titles: movieTitles });
    }
  });
});


app.post('/savePayment', (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Insert payment details into the 'payments' table
    const insertQuery = 'INSERT INTO payments (userId, amount) VALUES (?, ?)';
    const values = [userId, amount];

    connection.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error('Error inserting payment details:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      } else {
        console.log('Payment details saved successfully');
        res.status(200).json({ success: true });
      }
    });
  } catch (error) {
    console.error('Error saving payment details:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



const PORT = process.env.PORT || 8800;


app.listen(PORT,'0.0.0.0', () => {
  console.log(`server running on ${PORT}`);
});



