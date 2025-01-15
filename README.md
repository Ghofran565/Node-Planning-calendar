# Node.js Planning Calendar

This repository hosts a **Planning Calendar API** built with Node.js, designed to manage scheduling, user interactions, and administrative functionalities.

## Project Structure

- **Controllers**: Handles business logic for core functionalities.
- **Middlewares**: Manages authentication, authorization, and file validation.
- **Models**: Defines schemas and interacts with the database.
- **Routes**: Organizes API endpoints.
- **Utilities**: Reusable helper functions for error handling, uploads, and more.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ghofran565/Node-Planning-calendar.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Node-Planning-calendar
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file using the provided `config.env` template and configure your environment variables.
5. Start the server:
   ```bash
   npm run server
   ```

## API Endpoints Examples

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| POST   | `/api/auth/login` | User login               |
| GET    | `/api/courses`   | Fetch all courses         |
| POST   | `/api/upload`    | Upload a file            |
| GET    | `/api/reports`   | Generate reports         |

(Refer to the respective route files in the `Routes` directory for full details.)

## Development Phase

**Phase**: Finished - small updates needed
**Current Focus**:  
-   Adding swagger to this project 

This phase ensures the stability and reliability of all API endpoints before moving to production.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the [MIT License](LICENSE).
