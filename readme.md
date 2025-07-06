### Add JSON Web Token (JWT) authentication to your existing RESTful API. Ensure secure handling of tokens and implement a protected route.

## Week 7 Assignment

### Submitted by singh.jaskaran2024@gmail.com

1. clone the project. -> npm i (in both folders)
2. Setup postgres config in src/config/config.json
3. Run both ApiGateway and AuthService separately
4. View the excalidraw document to view detailed implementation and output: https://excalidraw.com/#json=iShUkQqzoQUlBAQLSfHkP,S2_a74bztZo5iFsEETuhUQ
5. Implemented reset password route from scratch.
6. Used jwt + cookies for authentication.
7. Also used nodemailer to send Otp's over email to user after successful signup.

Setting up config.json

```
{
  "development": {
    "username": eg. "neondb_owner",
    "password": "",
    "database": "",
    "host": "",
    "dialect": "postgres",
    "ssl": true,
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}

```

Inside authService setup env with port, email id, pass for smtp server
