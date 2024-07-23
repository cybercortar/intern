const dns = require('dns');
const portscanner = require('portscanner');
const readline = require('readline');
const { exec } = require('child_process');

// Function to resolve the IP address of a given hostname
function resolveIPAddress(hostname) {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, (err, address) => {
            if (err) {
                reject(err);
            } else {
                resolve(address);
            }
        });
    });
}

// Function to scan open ports for a given IP address
function scanOpenPorts(ip) {
    return new Promise((resolve, reject) => {
        portscanner.findAPortInUse(1, 65535, ip, (error, port) => {
            if (error) {
                reject(error);
            } else {
                resolve(port);
            }
        });
    });
}

// Function to detect the service running on a given port
function detectService(ip, port) {
    return new Promise((resolve, reject) => {
        // Using nmap for service detection
        exec(`nmap -p ${port} ${ip}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Create an interface for reading user input from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask the user to enter a website URL
rl.question('Please enter the website URL (e.g., example.com): ', (hostname) => {
    resolveIPAddress(hostname)
        .then(ip => {
            console.log(`IP address for ${hostname}: ${ip}`);
            return scanOpenPorts(ip).then(port => {
                console.log(`Open port: ${port}`);
                return detectService(ip, port);
            }).then(serviceInfo => {
                console.log(`Service Info: \n${serviceInfo}`);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            rl.close();
        });
});
