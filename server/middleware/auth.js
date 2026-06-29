import jwt from "jsonwebtoken";

const auth = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        message: "No token provided"
      });

    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        message: "Invalid token"
      });

    }

    const decodedData =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.userId =
      decodedData?.id;

    next();

  } catch (error) {

    console.log(error);

    return res.status(401).json({
      message: "Authentication failed"
    });

  }

};

export default auth;