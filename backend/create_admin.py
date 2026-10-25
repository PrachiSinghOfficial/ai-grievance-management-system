import os
from getpass import getpass

from dotenv import load_dotenv
from pymongo import MongoClient
from pwdlib import PasswordHash




load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise RuntimeError(
        "MONGODB_URL is missing from .env"
    )




client = MongoClient(MONGODB_URL)

db = client["campus_resolve"]

users_collection = db["students"]




password_hash = PasswordHash.recommended()




print()
print("=" * 50)
print("CampusResolve - Admin Account Setup")
print("=" * 50)
print()

name = input("Admin name: ").strip()

email = input("Admin email: ").strip().lower()

password = getpass(
    "Admin password: "
)

confirm_password = getpass(
    "Confirm admin password: "
)




if not name:
    raise ValueError(
        "Admin name cannot be empty."
    )

if not email:
    raise ValueError(
        "Admin email cannot be empty."
    )

if not password:
    raise ValueError(
        "Admin password cannot be empty."
    )

if password != confirm_password:
    raise ValueError(
        "Passwords do not match."
    )




existing_user = users_collection.find_one({
    "email": email
})

if existing_user:

    print()
    print(
        "An account with this email already exists."
    )

    print(
        "Current role:",
        existing_user.get(
            "role",
            "student"
        )
    )

    raise SystemExit()




hashed_password = password_hash.hash(
    password
)

admin_data = {

    "name": name,

    "email": email,

    "course": "Administration",

    "password": hashed_password,

    "role": "admin"
}


users_collection.insert_one(
    admin_data
)




print()
print("=" * 50)
print("ADMIN ACCOUNT CREATED SUCCESSFULLY")
print("=" * 50)
print()
print("Email:", email)
print("Role: admin")
print()
print(
    "You can now use this account "
    "for the CampusResolve Admin Portal."
)
print()