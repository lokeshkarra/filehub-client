# FileHub Client

## Project Overview

FileHub Client is a modern web application designed for managing and sharing files efficiently. It provides a user-friendly interface for uploading, downloading, and organizing files, along with features like file type distribution visualization and recent uploads tracking.

## Technologies Used

This project is built using the following technologies:

- **Vite**: A fast build tool for modern web applications.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **React**: A popular library for building user interfaces.
- **shadcn-ui**: A component library for building accessible and customizable UI components.
- **Tailwind CSS**: A utility-first CSS framework for styling.

## Getting Started

Follow the steps below to set up and run the project locally.

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **npm**: Comes bundled with Node.js. Alternatively, you can use [yarn](https://yarnpkg.com/).

### Installation

1. **Clone the Repository**:

   ```sh
   git clone https://github.com/lokeshkarra/filehub-client.git
   ```

2. **Navigate to the Project Directory**:

   ```sh
   cd filehub-client
   ```

3. **Install Dependencies**:

   ```sh
   npm install
   ```

4. **Start the Development Server**:

   ```sh
   npm run dev
   ```

   The application will be available at `http://localhost:3000` by default.

## Features

- **File Management**: Upload, download, and delete files.
- **File Type Distribution**: Visualize file types using a pie chart.
- **Recent Uploads**: View recently uploaded files with details like size and upload date.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Folder Structure

The project follows a modular folder structure for better maintainability:

```
src/
├── components/    # Reusable UI components
├── context/       # Context providers for global state management
├── pages/         # Application pages (e.g., Dashboard, FilesPage)
├── services/      # API service functions
├── styles/        # Global styles and Tailwind configurations
├── utils/         # Utility functions
```

## Deployment

To deploy the project, follow these steps:

1. Build the project:

   ```sh
   npm run build
   ```

2. Deploy the contents of the `dist/` folder to your preferred hosting provider (e.g., Vercel, Netlify, AWS S3).

## Customization

### Tailwind CSS

You can customize the design by modifying the Tailwind configuration file located at `tailwind.config.js`.

### API Integration

The API endpoints are defined in the `src/services/` folder. Update the `API_URL` in `src/services/api.ts` to point to your backend server.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```sh
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```sh
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License

[Apache 2.0](https://github.com/lokeshkarra/filehub-client?tab=Apache-2.0-1-ov-file)

## Contact

**Lokeshwar Reddy Karra**  
📧 [Email](mailto:lokeshwarreddy.karra@gmail.com)
