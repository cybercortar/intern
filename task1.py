import ssl
import socket
import datetime

def get_ssl_expiry_date(hostname):
    context = ssl.create_default_context()
    with socket.create_connection((hostname, 443)) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as ssock:
            ssl_info = ssock.getpeercert()
            return ssl_info

def parse_ssl_info(ssl_info):
    not_before = datetime.datetime.strptime(ssl_info['notBefore'], '%b %d %H:%M:%S %Y %Z')
    not_after = datetime.datetime.strptime(ssl_info['notAfter'], '%b %d %H:%M:%S %Y %Z')
    current_time = datetime.datetime.utcnow()
    remaining_time = not_after - current_time
    return not_before, not_after, remaining_time

def main():
    website = input("Enter the website (e.g., www.example.com): ")
    ssl_info = get_ssl_expiry_date(website)
    not_before, not_after, remaining_time = parse_ssl_info(ssl_info)
    
    print(f"Issue Date: {not_before}")
    print(f"Expiry Date: {not_after}")
    print(f"Time until expiry: {remaining_time}")

if __name__ == "__main__":
    main()
