# Patient Health Record System

A client-side application for managing patient health records using SQLite in the browser.

## Features

- Add, update, search, and delete patient records
- List all patients in the database
- Export and import the SQLite database
- Persistent storage using localStorage

## Tech Stack

- HTML, CSS, JavaScript
- SQL.js (SQLite implementation in JavaScript)
- Local browser storage

## Files

- `index.html` - The main HTML file
- `styles.css` - CSS styles
- `app.js` - JavaScript application logic
- `netlify.toml` - Netlify configuration file

## Deployment to Netlify

### Method 1: Netlify Drop (Easiest)

1. Create a folder on your computer with all the files from this project
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the folder onto the drop zone
4. Your site will be deployed with a random URL
5. You can change the URL or connect a custom domain in the Netlify dashboard

### Method 2: Using Git

1. Create a new repository on GitHub
2. Push all the files to your repository
3. Log in to [Netlify](https://app.netlify.com/)
4. Click "New site from Git"
5. Choose GitHub and select your repository
6. In the deploy settings:
   - Build command: Leave empty
   - Publish directory: `.`
7. Click "Deploy site"

## Important Notes

- The database is stored in your browser's localStorage, which means:
  - It's limited to the browser you're using
  - It has size limitations (usually 5-10MB)
  - Clearing browser data will delete the database
- Use the export/import feature to backup your data regularly
- This application is for demonstration purposes and is not intended for actual patient data (which would require proper security measures and compliance with healthcare regulations)