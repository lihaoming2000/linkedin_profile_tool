# LinkedIn Profile Scraper

This project is a LinkedIn profile scraper that automatically downloads LinkedIn profiles as PDF files.

## Features

- Automatically connects to an existing Chrome browser instance
- Downloads LinkedIn profiles as PDF files
- Processes multiple profiles from a CSV file
- Saves PDFs with unique filenames
- Includes random delays to avoid being blocked

## Prerequisites

- Node.js installed
- Chrome browser
- LinkedIn account (already logged in)

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Usage

1. Start Chrome in debug mode:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

2. Run the script:
```bash
node index.js
```

## CSV File Format

The script reads from `Input.csv` which should have the following format:
```
First Name,Title,Company,Email,Email Status,Person Linkedin Url,Website
```

## Output

PDF files are saved in the `Download` folder with filenames in the format: `Name_Timestamp.pdf`

## Notes

- Make sure you are already logged into LinkedIn in Chrome
- The script includes random delays between operations to avoid being blocked
- Tested with the first 3 records from the CSV file 