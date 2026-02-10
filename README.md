# Beast MovieFlix

Beast MovieFlix is a comprehensive movie logging and social platform application built with a modern, responsive frontend and a robust Java Spring Boot backend. It allows users to track their watched movies, rate and review them, manage a watchlist, and interact with other users through groups and following features.

## 🚀 Features

### Core Features
- **Movie Logging**: Log movies you've watched with ratings, reviews, and rewatch counts.
- **Diary**: View your movie history in a filterable diary view.
- **Watchlist**: Keep track of movies you want to watch.
- **Favorites**: Showcase your top 4 favorite movies on your profile.
- **Data Export**: Export your movie logs to CSV (Admin only feature currently).

### Social Features
- **User Profiles**: View public profiles with stats, bio, and favorite movies.
- **Follow System**: Follow other users to see their activity.
- **Groups**: Create and join groups to discuss movies.
- **Group Chat**: Real-time chat within groups.
- **Friends**: Find and add friends to groups.

### Authentication & Security
- **Secure Auth**: JWT-based authentication with Spring Security.
- **Email Verification**: OTP-based email verification for registration and login.
- **Role-Based Access**: distinct roles for Users and Admins.

### Admin Panel
- **User Management**: View and manage users.
- **Statistics**: Dashboard with total users, movies logged, and groups created.
- **Export Data**: Export system-wide data.

## 🛠️ Tech Stack

### Frontend
- **HTML5 & Vanilla CSS3**: Custom responsive design with a dark/red aesthetic.
- **Vanilla JavaScript (ES6+)**: Dynamic UI updates without heavy frameworks.
- **LocalStorage**: Client-side data persistence for optimal performance.

### Backend
- **Java 17**: Core language.
- **Spring Boot 3**: Framework for REST APIs.
- **Spring Security**: Authentication and authorization.
- **Spring Data JPA**: Database interaction.
- **MySQL**: Relational database.
- **JavaMailSender**: Email services for OTP.

## 📦 Project Structure

```
beast-movieflix/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/       # Java Source Code
│   │   ├── config/          # Security & App Config
│   │   ├── controller/      # API Controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # Database Entities
│   │   ├── repository/      # JPA Repositories
│   │   └── service/         # Business Logic
│   └── src/main/resources/  # Config files (application.properties)
│
└── frontend/                # Web Frontend
    ├── css/                 # Stylesheets
    ├── js/                  # JavaScript Logic
    ├── pages/               # HTML Pages
    └── components/          # Reusable HTML snippets (header, etc.)
```

## ⚙️ Setup & Installation

### Prerequisites
- Java JDK 17+
- Maven
- MySQL Server
- Modern Web Browser

### Backend Setup
1.  Navigate to the `backend` directory.
2.  Configure your database settings in `src/main/resources/application.properties`.
3.  Run the application using Maven:
    ```bash
    ./mvnw spring-boot:run
    ```

### Frontend Setup
1.  Navigate to the `frontend` directory.
2.  Open `pages/index.html` or `pages/login.html` in your browser.
    *   (Optional) Use a simplified local server like Live Server in VS Code for better performance with modules.

## 📝 API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`
- **User**: `/api/user/profile`, `/api/user/search`, `/api/user/follow/{id}`
- **Movies**: `/api/movies/search`, `/api/movies/log`, `/api/movies/watchlist`
- **Groups**: `/api/groups`, `/api/groups/{id}/messages`

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Developed by **Satheesh Kumar**
