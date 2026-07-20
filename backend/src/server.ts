import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { createClient } from "redis";
import os from "node:os";

import type { NextFunction, Request, Response, RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Db } from "mongodb";
import type {
  UpdateUserBody,
  UserDocument,
  UserIdParams
} from "./types/user.js";

import { connectToDb, getDB } from "./dataBase.js";

let db : Db;

export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const app = express();


const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379"
});

redisClient.on("error", function(error) {
  console.error("Redis error:", error);
});

const DEFAULT_TTL = 30;

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 500000
  },

  fileFilter: function(req, file, cb) {
    if (file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only PNG files are allowed"));
    }
  }
});

const uploadUserImage = upload.single("image") as unknown as RequestHandler<
  UserIdParams,
  unknown,
  UpdateUserBody
>;

app.use(cors());
app.use(express.json());


async function getUsers(): Promise<UserDocument[]>  {
  try {
    const cachedUsers = await redisClient.get("users");

    if (cachedUsers !== null) {
      console.log("Users loaded from Redis");
      return JSON.parse(cachedUsers) as UserDocument[];
    }

    console.log("Users loaded from MongoDB");

    const users = await db
      .collection<UserDocument>("users")
      .find()
      .sort({ firstname: 1 })
      .toArray();

    await redisClient.set(
      "users",
      JSON.stringify(users),
      {
        EX: DEFAULT_TTL
      }
    );

    return users;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.get("/api/health", function(req, res) {
  const message = `Backend: ${os.hostname().slice(0, 5)}, is running`;

  res.status(200).json({
    message
  });
});

app.get("/api/users", [verifyTheToken], function(req : Request, res:Response) {
  getUsers()
    .then(users => {
      const usersWithImageInfo = users.map(function(user) {
        return {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          gender: user.gender,
          hasImage: !!(
            user.image &&
            user.image.data
          )
        };
      });

      res.status(200).json(usersWithImageInfo);
    })
    .catch(error => {
      console.error("Error fetching users:", error);

      res.status(500).json({
        error: "could not fetch the documents"
      });
    });
});

app.post("/api/users", upload.single("image"),async function(req, res) {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const gender = req.body.gender;

    if (!firstname || !lastname || !gender) {
      return res.status(400).json({
        message: "firstname, lastname, and gender are required"
      });
    }

    try {
      const users = await getUsers();

      const exists = users.some(function(user) {
        return (
          user.firstname === firstname &&
          user.lastname === lastname &&
          user.gender === gender
        );
      });

      if (exists) {
        return res.status(409).json({
          message: "User already exists"
        });
      }

      let resizedImage = null;

      if (req.file) {
        resizedImage = await sharp(req.file.buffer)
          .resize(200, 200, {
            fit: "contain"
          })
          .png()
          .toBuffer();
      }

      const newUser = {
        firstname: firstname,
        lastname: lastname,
        gender: gender,

        image: resizedImage
          ? {
              data: resizedImage,
              contentType: "image/png"
            }
          : null
      };

      const result = await db
        .collection("users")
        .insertOne(newUser);

      res.status(201).json({
        _id: result.insertedId,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        gender: newUser.gender,
        hasImage: newUser.image !== null
      });

    } catch (error) {
      console.error("Error creating user:", error);

      res.status(500).json({
        error: "could not create a new document"
      });
    }
  }
);

app.delete("/api/users/:id", function(req, res) {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("users")
      .deleteOne({
        _id: new ObjectId(req.params.id)
      })
      .then(result => {
        res.status(200).json(result);
      })
      .catch(error => {
        console.error("Error deleting user:", error);

        res.status(500).json({
          error: "could not delete the document"
        });
      });

  } else {
    res.status(400).json({
      error: "not valid document id"
    });
  }
});

app.get("/api/profile-data", function(req, res) {
  const nameParam = String(req.query.name || "").trim();

  res.json({
    personName: nameParam || "Guest"
  });
});

app.get("/api/users/:id", function(req, res) {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("users")
      .findOne({
        _id: new ObjectId(req.params.id)
      })
      .then(result => {
        if (!result) {
          return res.status(404).json({
            error: "user not found"
          });
        }

        res.status(200).json({
          _id: result._id,
          firstname: result.firstname,
          lastname: result.lastname,
          gender: result.gender,
          hasImage: result.image !== null
        });
      })
      .catch(error => {
        console.error("Error fetching user:", error);

        res.status(500).json({
          error: "could not fetch the document"
        });
      });

  } else {
    return res.status(400).json({
      error: "invalid user id"
    });
  }
});

app.patch(
  "/api/users/:id",
 uploadUserImage,
  async function (
    req: Request<UserIdParams, unknown, UpdateUserBody>,
    res: Response
  ) :Promise<void>{
    const id = req.params.id;

    if (!id || !ObjectId.isValid(id)) {
      res.status(400).json({
        error: "invalid user id"
      });
      return;
    }

    const updates: UpdateUserBody & {
      image?: {
        data: Buffer;
        contentType: string;
      };
    } = {};

    if (req.body.firstname !== undefined) {
      updates.firstname = req.body.firstname;
    }

    if (req.body.lastname !== undefined) {
      updates.lastname = req.body.lastname;
    }

    if (req.body.gender !== undefined) {
      updates.gender = req.body.gender;
    }

    try {
      if (req.file) {
        const resizedImage = await sharp(req.file.buffer)
          .resize(200, 200, {
            fit: "contain"
          })
          .png()
          .toBuffer();

        updates.image = {
          data: resizedImage,
          contentType: "image/png"
        };
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          error: "no update fields were provided"
        });
        return;
      }

      const result = await db
      .collection<UserDocument>("users")
      .findOneAndUpdate(
        {
          _id: new ObjectId(id)
        },
        {
          $set: updates
        },
        {
          returnDocument: "after"
        }
      );

      if (!result) {
        res.status(404).json({
          error: "user not found"
        });
      return;
      }

      res.status(200).json({
        _id: result._id,
        firstname: result.firstname,
        lastname: result.lastname,
        gender: result.gender,
        hasImage: Boolean(result.image?.data)
      });
      return;
    } catch (error) {
      console.error("Error updating user:", error);

      res.status(500).json({
        error: "could not update the document"
      });
      return;
    }
  }
);

app.get("/api/users/:id/image", function(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      error: "invalid user id"
    });
  }

  db.collection("users")
    .findOne({
      _id: new ObjectId(req.params.id)
    })
    .then(result => {
      if (!result) {
        return res.status(404).json({
          error: "user not found"
        });
      }

      if (!result.image || !result.image.data) {
        return res.status(404).json({
          error: "no image found"
        });
      }

      res.set("Content-Type", result.image.contentType);

      res.send(
        result.image.data.buffer ||
        result.image.data
      );
    })
    .catch(error => {
      console.error("Error fetching image:", error);

      res.status(500).json({
        error: "could not fetch the image"
      });
    });
});


function verifyTheToken(req : AuthenticatedRequest, res:Response, next: NextFunction){
    const headerAuthorization = req.headers.authorization;
    if (!headerAuthorization){
        return res.status(401).json({
            error: "Token is required"
    })}
    console.log(headerAuthorization);

    const token= headerAuthorization.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!token || !jwtSecret) {
    res.status(401).json({
      error: "Token or JWT secret is missing"
    });
    return;
    }
    try {
        const decoded = jwt.verify(
           token,
           jwtSecret
        );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}


app.post("/api/connect/token",(req,res)=>{
  try {
    const username = req.body.username;
    const password = req.body.password;

  if (username !== "admin" || password !== "admin") {
    return res.status(401).json({
      error: "Invalid username or password"
    });
  }
  
    const payload = {
      userId: "123",
      username: username
    };

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
    res.status(500).json({
      error: "Token or JWT secret is missing"
    });
    return;
    }
    const token = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "1h"}
    );

    res.status(200).json({
      token
    });

  } catch (error) {
    console.error("Token creation failed:", error);

    res.status(401).json({
      error: "Unauthorized"
    });
  }
})

const PORT = Number(process.env.PORT) || 3000;

app.use(function(error:unknown, req :Request, res: Response, next:NextFunction) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Image must be smaller than 500KB"
      });
    }

    return res.status(400).json({
      error: error.message
    });
  }

  if (error instanceof Error) {
    return res.status(400).json({
      error: error.message
    });
  }

  next();
});

connectToDb(async function(err) {
  if (!err) {
    try {
      db = getDB();

      await redisClient.connect();
      console.log("Connected to Redis");

      app.listen(
        PORT,
        "0.0.0.0",
        function() {
          console.log(
            "Server running on port " + PORT
          );
        }
      );

    } catch (error) {
      console.error(
        "Could not connect to Redis:",
        error
      );
    }

  } else {
    console.log(
      "Could not connect to database"
    );
  }
});