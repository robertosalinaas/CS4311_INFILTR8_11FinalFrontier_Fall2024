const fs = require('fs');
const path = require('path');

function logToCSV(message) {
    const dir = path.join(__dirname, 'logsFolder');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, 'log.csv');
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const logMessage = `"${message}", "${date}", "${time}"\n`;

    // Append the message to the CSV file
    fs.appendFile(filePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
        } else {
            console.log('Message logged to CSV file:', logMessage);
        }
    });
}

module.exports = { logToCSV };
