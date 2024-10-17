import { appendFile } from 'fs';

export function logToCSV(message){
    const filePath = 'logsFolder/log.csv';
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const logMessage = `"${message}", "${date}", "${time}"\n`;

    // Append the message to the CSV file
    appendFile(filePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
        } else {
            console.log('Message logged to CSV file:', logMessage);
        }
    });
}

// Example usage
// logToCSV('This is a log message');