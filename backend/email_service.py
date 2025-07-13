import smtplib
from email.mime.text import MIMEText

def send_email(to, content):
    sender_email = "samikshasubash22@gmail.com"
    sender_password = "thtn qogf oolu izsl"  
    msg = MIMEText(content)
    msg["Subject"] = "Order Confirmation"
    msg["From"] = sender_email
    msg["To"] = to

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

def send_reset_code_email(to, code):
    sender_email = "samikshasubash22@gmail.com"
    sender_password = "thtn qogf oolu izsl"  

    subject = "Password Reset Code"
    content = f"Your password reset code is: {code}"

    msg = MIMEText(content)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)