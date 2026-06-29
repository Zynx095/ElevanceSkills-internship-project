# YukithHub

A modern full-stack community platform built with the MERN stack that combines social networking, multilingual support, secure authentication, subscriptions, reward points, and intelligent access control into a single application.

Designed as a production-style academic project, YukithHub focuses on security, scalability, and user engagement while implementing multiple real-world authentication and authorization workflows.

---

## Features

### Authentication & Security

* Secure JWT Authentication
* Email OTP Verification
* Mobile OTP Verification (TextBee SMS Gateway)
* Forgot Password using Email or Mobile
* One Forgot Password request per day
* Automatic random password generation
* Browser-based authentication rules
* Device-based login restrictions
* Login history tracking
* Session management

---

### Community Platform

* Public community feed
* Upload images and videos
* Like posts
* Comment on posts
* Share posts
* Friend requests
* Accept / Reject requests
* Friend management
* Public user profiles
* Edit profile
* Technology tags

---

### Smart Posting Restrictions

Users are rewarded for building meaningful connections.

| Friends |    Daily Public Posts |
| ------- | --------------------: |
| 0       |           Not Allowed |
| 1       |                1 Post |
| 2       |               2 Posts |
| 3–10    | Equal to Friend Count |
| >10     |             Unlimited |

---

### Subscription System

Integrated with Razorpay.

Plans include:

* Free
* Bronze
* Silver
* Gold

Question posting limits automatically change according to the user's active subscription.

Payments are only allowed between:

10:00 AM – 11:00 AM IST

After successful payment:

* Subscription is activated
* Invoice generated
* Invoice emailed automatically

---

### Reward System

Users earn reward points by contributing.

* +5 points for every answer
* +5 bonus after receiving 5 upvotes
* Transfer reward points to other users
* Transfer restricted unless balance exceeds 10 points
* Automatic deduction when answers are removed or downvoted

---

### Multi-language Support

Supports six languages:

* English
* Spanish
* Hindi
* Portuguese
* Chinese
* French

Language switching is secured:

French

→ Email OTP Verification

All Other Languages

→ Mobile OTP Verification

---

### Login History

Every successful login stores:

* Browser
* Operating System
* Device Type
* IP Address
* Login Timestamp

Displayed inside the user's profile for transparency and security.

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* ShadCN UI
* Lucide React
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* UAParser

### Third Party Services

* Razorpay
* Gmail SMTP
* TextBee SMS Gateway

---

## Project Architecture

Client

↓

REST API

↓

Express Server

↓

MongoDB

↓

Authentication

↓

Community

↓

Subscriptions

↓

Reward System

↓

Language Engine

---

## Folder Structure

```
server/
│
├── controller/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/

stack/
│
├── src/
│   ├── components/
│   ├── layout/
│   ├── lib/
│   ├── pages/
│   └── styles/
```

---

## Installation

Clone the repository

```
git clone <repository-url>
```

Backend

```
cd server

npm install
```

Frontend

```
cd stack

npm install
```

---

## Environment Variables

Backend (`server/.env`)

```
PORT=

MONGO_URI=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=

TEXTBEE_API_KEY=

TEXTBEE_DEVICE_ID=

TEXTBEE_BASE_URL=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=
```

Frontend (`stack/.env.local`)

```
NEXT_PUBLIC_API_URL=
```

---

## Running the Project

Backend

```
cd server

npm start
```

Frontend

```
cd stack

npm run dev
```

Application

```
http://localhost:3000
```

---

## Security Features

* Password hashing using bcrypt
* JWT Authentication
* OTP-based verification
* Email authentication
* Mobile authentication
* Browser-aware login
* Device-aware restrictions
* Time-restricted payments
* Time-restricted mobile logins
* Login history tracking

---

## Assignment Requirements Covered

* Public community page
* Friend-based posting restrictions
* Forgot Password
* Random password generation
* Subscription system
* Razorpay integration
* Invoice generation
* Reward points
* Point transfer
* Multi-language support
* Email OTP
* Mobile OTP
* Login history
* Browser detection
* Device detection
* IP tracking

---

## Future Improvements

* Real-time notifications
* Direct messaging
* AI-powered moderation
* Advanced search
* Two-Factor Authentication
* Push notifications
* Progressive Web App support

---

## Author

**Yukith M Joseph**

Computer Science & Engineering (Networks)

Presidency University, Bengaluru

Portfolio: https://yukithjoseph.me

GitHub: https://github.com/Zynx095

LinkedIn: https://linkedin.com/in/yukith-joseph

---

## License

This project is developed for educational and academic purposes.

