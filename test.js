// Import required modules
const https = require('https'); // To make HTTPS requests
const readline = require('readline'); // To handle user input
const { differenceInDays, formatDistanceToNow } = require('date-fns'); // To handle date calculations

// Function to get SSL certificate information for a given hostname
function getCertificateInfo(hostname) {
    return new Promise((resolve, reject) => {
        // Set up options for the HTTPS request
        const options = {
            host: hostname,
            port: 443,
            method: 'GET',
            rejectUnauthorized: false, // Allow self-signed certificates
        };

        // Make the HTTPS request
        const req = https.request(options, (res) => {
            // Get the SSL certificate from the response socket
            const certificate = res.socket.getPeerCertificate();
            if (!certificate || !Object.keys(certificate).length) {
                reject(new Error('The website did not provide a certificate'));
                return;
            }

            // Parse the certificate dates
            const validFrom = new Date(certificate.valid_from);
            const validTo = new Date(certificate.valid_to);
            const now = new Date();

            // Calculate days until expiration and formatted time until expiration
            const daysUntilExpiration = differenceInDays(validTo, now);
            const timeUntilExpiration = formatDistanceToNow(validTo);

            // Create an info object with relevant certificate details
            const info = {
                validFrom: validFrom.toISOString(),
                validTo: validTo.toISOString(),
                daysUntilExpiration,
                timeUntilExpiration,
                issuer: certificate.issuer,
                subject: certificate.subject,
            };

            // Resolve the promise with the certificate info
            resolve(info);
        });

        // Handle errors in the request
        req.on('error', (e) => {
            reject(e);
        });

        // End the request
        req.end();
    });
}

// Create an interface for reading user input from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask the user to enter a website URL
rl.question('Please enter the website URL (e.g., example.com): ', (hostname) => {
    // Get the SSL certificate information for the provided hostname
    getCertificateInfo(hostname)
        .then((info) => {
            // Log the certificate information
            console.log(`Certificate Information for ${hostname}:`);
            console.log(`Valid From: ${info.validFrom}`);
            console.log(`Valid To: ${info.validTo}`);
            console.log(`Days Until Expiration: ${info.daysUntilExpiration}`);
            console.log(`Time Until Expiration: ${info.timeUntilExpiration}`);
            console.log(`Issuer:`, info.issuer);
            console.log(`Subject:`, info.subject);
        })
        .catch((error) => {
            // Log any errors that occur
            console.error('Error retrieving certificate information:', error);
        })
        .finally(() => {
            // Close the readline interface
            rl.close();
        });
});
