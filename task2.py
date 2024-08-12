import socket
import nmap

def get_ip_address(website):
    try:
        ip_address = socket.gethostbyname(website)
        return ip_address
    except socket.gaierror:
        print("Could not resolve the website.")
        return None

def scan_ports(ip_address):
    nm = nmap.PortScanner()
    nm.scan(ip_address, '1-1024')  # Scanning ports 1 to 1024, you can adjust the range as needed
    open_ports = nm[ip_address]['tcp'].keys()
    return open_ports, nm

def get_service_info(nm, ip_address, port):
    service_name = nm[ip_address]['tcp'][port]['name']
    service_version = nm[ip_address]['tcp'][port]['version']
    return service_name, service_version

def main():
    website = input("Enter the website (e.g., www.example.com): ")
    ip_address = get_ip_address(website)
    if ip_address:
        print(f"IP Address of {website}: {ip_address}")
        
        open_ports, nm = scan_ports(ip_address)
        if open_ports:
            print("Open Ports and Services:")
            for port in open_ports:
                service_name, service_version = get_service_info(nm, ip_address, port)
                print(f"Port: {port}, Service: {service_name}, Version: {service_version}")
        else:
            print("No open ports found.")
    else:
        print("Failed to retrieve IP address.")

if __name__ == "__main__":
    main()
