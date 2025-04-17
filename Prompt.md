# LinkedIn Profile Scraper Development Prompt

## Project Requirements

1. Develop a Node.js script that:
   - Connects to an existing Chrome browser instance
   - Navigates to LinkedIn profile pages
   - Automatically clicks the "More" button and "Save to PDF" option
   - Saves the PDF files with unique names

2. Key Features:
   - Use Puppeteer to control Chrome
   - Process multiple profiles from a CSV file
   - Implement random delays to avoid being blocked
   - Save PDFs in a dedicated folder

3. Technical Requirements:
   - Use XPath for element location
   - Handle errors gracefully
   - Include proper logging
   - Ensure unique filenames for PDFs

4. Testing:
   - Test with the first 3 records from the CSV
   - Verify PDF generation and saving
   - Check error handling

## Development Notes

- The script should be robust and handle various edge cases
- Include proper error messages and logging
- Ensure the script can be easily maintained and modified
- Document all major functions and their purposes

puppeteer 版本 21.11.0 已被弃用，请确保你使用的是 22.8.2 或更高版本以及相关的API




