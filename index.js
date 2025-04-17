const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Create Download folder
const downloadDir = path.join(__dirname, 'Download');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

async function downloadLinkedInProfile(url) {
    let browser = null;
    try {
        console.log('Attempting to connect to Chrome browser...');
        console.log('Please ensure Chrome is started in debug mode using:');
        console.log('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222');
        
        // Try to connect to existing Chrome browser
        try {
            browser = await puppeteer.connect({
                browserURL: 'http://localhost:9222',
                defaultViewport: null
            });
        } catch (connectError) {
            console.error('Failed to connect to Chrome. Please ensure:');
            console.error('1. Chrome is started in debug mode');
            console.error('2. Correct port number is used (default 9222)');
            console.error('3. You are logged into LinkedIn in Chrome');
            throw new Error('Unable to connect to Chrome browser. Please check the above conditions');
        }

        // Get the first tab
        const pages = await browser.pages();
        if (pages.length === 0) {
            throw new Error('No open tabs found');
        }
        const page = pages[0];
        
        // Set download behavior
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadDir
        });

        // Visit LinkedIn page
        console.log('Visiting LinkedIn page...');
        try {
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            console.log('Page initially loaded...');

            // Wait for page to fully load
            console.log('Waiting for page to fully load...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log('Page fully loaded');

            // 1) Locate "More" button
            console.log('Looking for More button...');
            let retries = 0;
            let moreButton = null;
            
            while (retries < 3) {
                moreButton = await page.evaluate(() => {
                    const xpath = '//*[normalize-space(text())="More"]';
                    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                });
                
                if (moreButton) break;
                
                console.log(`More button not found, waiting 2 seconds before retry (attempt ${retries + 1})...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                retries++;
            }

            if (!moreButton) {
                throw new Error('Failed to find More button. Please ensure page is fully loaded');
            }

            // Click More button
            await page.evaluate((xpath) => {
                const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) element.click();
            }, '//*[normalize-space(text())="More"]');
            console.log('Clicked More button');

            // 2) Wait for menu to appear
            console.log('Waiting for menu to appear...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get profile name
            const nameElement = await page.$('h1');
            const name = await page.evaluate(el => el.textContent.trim(), nameElement);
            console.log(`Preparing to download ${name}.pdf`);

            // 3) Locate "Save to PDF" option
            console.log('Looking for Save to PDF option...');
            retries = 0;
            let saveToPdfOption = null;

            while (retries < 3) {
                saveToPdfOption = await page.evaluate(() => {
                    const xpath = '//span[normalize-space(text())="Save to PDF"]';
                    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                });
                
                if (saveToPdfOption) break;
                
                console.log(`Save to PDF option not found, waiting 1 second before retry (attempt ${retries + 1})...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                retries++;
            }

            if (!saveToPdfOption) {
                throw new Error('Failed to find Save to PDF option. Please ensure menu is fully expanded');
            }

            // Click Save to PDF option
            await page.evaluate((xpath) => {
                const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) element.click();
            }, '//span[normalize-space(text())="Save to PDF"]');
            console.log('Clicked Save to PDF option');

            // Wait for PDF generation and download
            console.log('Waiting for PDF generation...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Rename downloaded file
            const timestamp = new Date().getTime();
            const oldPath = path.join(downloadDir, 'Profile.pdf');
            const newPath = path.join(downloadDir, `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`);
            
            try {
                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Renamed file to: ${path.basename(newPath)}`);
                } else {
                    console.log('Downloaded PDF file not found');
                }
            } catch (renameError) {
                console.error('Error renaming file:', renameError);
            }

            // Random wait between 5-15 seconds
            const randomWait = Math.floor(Math.random() * 10) + 5;
            console.log(`Random wait for ${randomWait} seconds...`);
            await new Promise(resolve => setTimeout(resolve, randomWait * 1000));
        } catch (error) {
            console.error('Error during operation:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error occurred:', error);
        if (browser) {
            try {
                await browser.disconnect();
            } catch (e) {
                console.error('Error disconnecting from browser:', e);
            }
        }
    }
}

async function processCSV() {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream('Input.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', reject);
    });
}

async function main() {
    try {
        const records = await processCSV();
        // Process only first 3 records
        const testRecords = records.slice(0, 3);
        
        for (const record of testRecords) {
            console.log(`\nProcessing: ${record['First Name']} ${record['Person Linkedin Url']}`);
            await downloadLinkedInProfile(record['Person Linkedin Url']);
        }
        
        console.log('\nTest completed!');
    } catch (error) {
        console.error('Error processing CSV file:', error);
    }
}

main(); 