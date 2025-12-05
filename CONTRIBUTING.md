# Contributing to Twin Messenger

Thank you for your interest in contributing to Twin-Messenger! 🎉
This document contains guidelines to ensure your contribution is effective.

## How can I contribute?

### 1. Reporting Bugs
If you find a bug, please create an "Issue" using our Bug Report template.
* Please specify if you are using XAMPP, Docker, or `php -S`.

### 2. Requesting Features
Open an Issue with the "enhancement" label explaining what you would like to see in the app (e.g., Emoji support, Groups, etc.).

### 3. Pull Requests (PR)
1. **Fork** the repository.
2. Create a new branch (`git checkout -b feature/NewCoolFeature`).
3. Make your changes.
    * **Backend:** If you modify the DB, please include the SQL update script.
    * **Frontend:** Maintain the coding style in `script.js`.
4. Commit your changes (`git commit -m 'Add: New cool feature'`).
5. Push to the branch (`git push origin feature/NewCoolFeature`).
6. Open a **Pull Request**.

## Project Structure
* `/api`: Backend logic (PHP).
* `/styles`: CSS files.
* `/images`: Graphic assets.
* `script.js`: Main client-side logic.

## Coding Standards
* Use consistent indentation (4 spaces).
* Comment complex functions.
* **Keep it Retro!** Do not use modern UI libraries (like Bootstrap/Material) that break the nostalgic aesthetic.
