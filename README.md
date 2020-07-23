# Google Contacts Organisation Directory Scraper
This is a Puppeteer Node.js script that web-scrapes the directory page of google contacts (of G-Suite Accounts) for name and email of all the members in an organisation.  

The results will be stored in output_type_1.json, output_type_2.json and raw_data.json files.

#### Installation

Install npm packages
```bash
npm install
```
For first use, Run 
```bash
node initial.js
```
This will open a chromium browser for google sign in, sign in to your account and close the browser, once you complete the sign in. This will create a user_data folder in the script directory, which will store your login session. 
Do This Only for the First Run.

You can delete this folder after usage to delete your session.

Run the Script
```bash
npm start
```
This will start the execution of the script and generate the output results files once execution is completed.

Author - Yogesh Choudhary - choudharyyogsa17ite@student.mes.ac.in
