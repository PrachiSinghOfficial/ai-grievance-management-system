
import os
import smtplib
from email.message import EmailMessage


def send_email(to_email, subject, body):
    try:
        message = EmailMessage()
        message["From"] = os.getenv("SMTP_EMAIL")
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        with smtplib.SMTP(
            os.getenv("SMTP_HOST"),
            int(os.getenv("SMTP_PORT", 587))
        ) as server:
            server.starttls()
            server.login(
                os.getenv("SMTP_EMAIL"),
                os.getenv("SMTP_APP_PASSWORD")
            )
            server.send_message(message)

        return True

    except Exception as error:
        print("Email sending failed:", error)
        return False
