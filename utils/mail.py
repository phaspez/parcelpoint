# Looking to send emails in production? Check out our Email API/SMTP product!
import smtplib

sender = "ParcelPoint <hello@demomailtrap.co>"
receiver = "Tri-Min Tram <tramtrimin@gmail.com>"

message = f"""\
Subject: Hi Mailtrap
To: {receiver}
From: {sender}

This is a test e-mail message."""

with smtplib.SMTP("live.smtp.mailtrap.io", 2525) as server:
    server.starttls()
    server.login("smtp@mailtrap.io", "306b792971af8eb4a82df38bfba30aba")
    server.sendmail(sender, receiver, message)
