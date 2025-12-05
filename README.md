# Twin Messenger 💬

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![PHP](https://img.shields.io/badge/backend-PHP-777BB4.svg)
![MySQL](https://img.shields.io/badge/database-MySQL-4479A1.svg)

> **Twin-Messenger** is a nostalgic chat application that revives the classic MSN Messenger experience. Built with native web technologies, it features instant messaging, user status, and the iconic "Buzz" (Nudge) feature.

---

## 📸 Demo

| Login | Contact List | Conversation |
|:---:|:---:|:---:|
| <img src="images/user.png" width="100"> | <img src="images/add.png" width="100"> | <img src="images/invite.png" width="100"> |
## 🚀 Features

- 📨 **Instant Messaging:** Fluid chat system using AJAX Polling.
- 🔔 **Buzz (Nudge):** Shake your contact's screen with the classic sound!
- 🟢 **User Status:** Automatic Online/Offline detection.
- 👥 **Contact Management:** Add friends via email.
- 🔊 **Sound Notifications:** Sounds for new messages and buzzes.
- 📱 **Responsive Design:** Adapted for mobile and desktop.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Backend:** PHP (Native, no frameworks).
* **Database:** MySQL / MariaDB.
* **Architecture:** REST API with PHP Session-based authentication.

## 🔧 Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* **PHP:** Version 7.4 or higher (must be in your system PATH).
* **MySQL:** (Recommended to use XAMPP/WAMP just to start the Database service).

### Steps

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/AngelSPerez/Twin-Messenger.git](https://github.com/AngelSPerez/Twin-Messenger.git)
    cd Twin-Messenger
    ```

2.  **Database Setup (MySQL)**
    * Start the MySQL service (via XAMPP or terminal).
    * Open phpMyAdmin or your preferred SQL manager.
    * Create a database named `twin_messenger`.
    * Import the `twin_messenger.sql` file located in the root of this project.

3.  **Connection Setup**
    Ensure you have a connection file in `api/` (e.g., `db_connect.php`) with your local credentials:
    ```php
    $host = 'localhost';
    $db   = 'twin_messenger';
    $user = 'root'; // Default XAMPP user
    $pass = '';     // Default XAMPP password (empty)
    ```

4.  **Start the Server**
    Use the built-in PHP development server:
    ```bash
    # Run this command in the project root directory
    php -S localhost:3000
    ```

5.  **Ready!**
    Open your browser at: `http://localhost:3000/index.html`

## 🧪 Test Users
The database includes pre-created accounts for quick testing:
* **User 1:** `angel@gmail.com` | **Pass:** `123456`
* **User 2:** `alex@gmail.com`  | **Pass:** `123456`

## 🤝 Contributing

Contributions are welcome! Please check the [CONTRIBUTING.md](CONTRIBUTING.md) file to see how to collaborate.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Made with nostalgia by [AngelSPerez](https://github.com/AngelSPerez)
