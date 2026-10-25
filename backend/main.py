import os
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from pwdlib import PasswordHash
import uuid
import re
from fastapi import File, Form, UploadFile
from botocore.exceptions import BotoCoreError, ClientError

from cloud_storage import (
    upload_file_to_s3,
    generate_presigned_url,
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI Grievance Management System",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MONGODB
# ============================================================

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise RuntimeError(
        "MONGODB_URL is not configured in .env"
    )

client = MongoClient(MONGODB_URL)

db = client["campus_resolve"]

students_collection = db["students"]

grievances_collection = db["grievances"]

notifications_collection = db["notifications"]
departments_collection = db["departments"]

required_departments = [
    "Hostel Department",
    "Library Department",
    "Canteen Department",
    "information technology",
    "Academic Department",
    "Faculty Affairs",
    "General Administration",
]

for name in required_departments:
    departments_collection.update_one(
        {"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}},
        {"$setOnInsert": {"name": name}},
        upsert=True
    )

audit_logs_collection = db["audit_logs"]


# ============================================================
# PASSWORD HASHING
# ============================================================

password_hash = PasswordHash.recommended()


# ============================================================
# JWT SETTINGS
# ============================================================

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured in .env"
    )

JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ============================================================
# OAUTH2
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# ============================================================
# COMMON HELPERS
# ============================================================

def utc_now():
    return datetime.now(timezone.utc)

def log_audit_action(
    actor,
    action,
    target_type,
    target_id=None,
    details=None
):
    audit_logs_collection.insert_one({
        "actor_id": str(actor.get("_id", "")),
        "actor_name": actor.get("name", "Unknown"),
        "actor_email": actor.get("email", ""),
        "actor_role": actor.get("role", "unknown"),
        "action": action,
        "target_type": target_type,
        "target_id": str(target_id) if target_id else None,
        "details": details or {},
        "created_at": utc_now()
    })

def object_id_or_400(value: str):
    """
    Convert string to MongoDB ObjectId.
    Raise 400 if invalid.
    """

    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=400,
            detail="Invalid ID."
        )

    return ObjectId(value)


def get_attachment_response(grievance):
    attachment = grievance.get("attachment")

    if not isinstance(attachment, dict):
        return None

    result = {
        "filename": attachment.get("filename"),
        "content_type": attachment.get("content_type"),
        "size": attachment.get("size"),
        "url": None,
    }

    object_name = attachment.get("key")

    if object_name:
        try:
            result["url"] = generate_presigned_url(object_name)
        except Exception as error:
            print(
                "Could not generate attachment URL:",
                type(error).__name__,
            )

    return result



# ============================================================
# AUTHENTICATION
# ============================================================

def get_current_student(
    token: str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        student_id = payload.get("sub")

        if not student_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        if not ObjectId.is_valid(student_id):
            raise HTTPException(
                status_code=401,
                detail="Invalid user ID."
            )

        student = students_collection.find_one(
            {
                "_id": ObjectId(student_id)
            }
        )

        if not student:
            raise HTTPException(
                status_code=401,
                detail="User account not found."
            )

        return student

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired."
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        )

    except HTTPException:

        raise

    except Exception as error:

        print(
            "Authentication error:",
            error
        )

        raise HTTPException(
            status_code=401,
            detail="Authentication failed."
        )


# ============================================================
# ROLE BASED ACCESS
# ============================================================

def require_role(*allowed_roles):

    def role_checker(
        current_user=Depends(get_current_student)
    ):

        user_role = current_user.get(
            "role",
            "student"
        )

        print("DEBUG ROLE:", repr(user_role), "| ALLOWED:", allowed_roles)

        if user_role not in allowed_roles:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "to access this resource."
                )
            )

        return current_user

    return role_checker


# ============================================================
# MODELS
# ============================================================

class StudentRegister(BaseModel):

    name: str

    email: EmailStr

    course: str

    password: str


class StudentLogin(BaseModel):

    email: EmailStr

    password: str


class GrievanceCreate(BaseModel):

    title: str

    category: str

    description: str

    anonymous: bool = False


class GrievanceUpdate(BaseModel):

    status: str | None = None

    priority: str | None = None


class UserRoleUpdate(BaseModel):

    role: str


class NotificationCreate(BaseModel):

    user_id: str

    title: str

    message: str

    notification_type: str = "general"


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message":
            "AI Grievance Management System API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    try:

        client.admin.command("ping")

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as error:

        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(error)
        }


# ============================================================
# STUDENT REGISTRATION
# ============================================================

@app.post("/register")
def register_student(
    student: StudentRegister
):

    existing_student = students_collection.find_one(
        {
            "email": student.email
        }
    )

    if existing_student:

        raise HTTPException(
            status_code=400,
            detail=(
                "An account with this email "
                "already exists."
            )
        )

    hashed_password = password_hash.hash(
        student.password
    )

    student_data = {

        "name": student.name,

        "email": student.email,

        "course": student.course,

        "password": hashed_password,

        "role": "student",

        "created_at": utc_now()
    }

    students_collection.insert_one(
        student_data
    )

    return {
        "message":
            "Student account created successfully."
    }


# ============================================================
# STUDENT LOGIN
# ============================================================

@app.post("/login")
def login_student(
    student: StudentLogin
):

    existing_student = students_collection.find_one(
        {
            "email": student.email
        }
    )

    if not existing_student:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    try:

        password_is_valid = password_hash.verify(
            student.password,
            existing_student["password"]
        )

    except Exception:

        password_is_valid = False

    if not password_is_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    user_role = existing_student.get(
        "role",
        "student"
    )

    token_data = {

        "sub":
            str(existing_student["_id"]),

        "email":
            existing_student["email"],

        "role":
            user_role,

        "exp":
            utc_now()
            + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
    }

    access_token = jwt.encode(
        token_data,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {

        "message":
            "Login successful",

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "student": {

            "id":
                str(existing_student["_id"]),

            "name":
                existing_student["name"],

            "email":
                existing_student["email"],

            "course":
                existing_student.get(
                    "course",
                    ""
                ),

            "role":
                user_role
        }
    }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/me")
def get_current_user(
    current_user=Depends(get_current_student)
):

    return {

        "id":
            str(current_user["_id"]),

        "name":
            current_user.get("name", ""),

        "email":
            current_user.get("email", ""),

        "course":
            current_user.get("course", ""),

        "role":
            current_user.get(
                "role",
                "student"
            )
    }


# ============================================================
# CREATE GRIEVANCE
# ============================================================

# ============================================================
# AUTOMATIC DEPARTMENT ASSIGNMENT
# ============================================================




# Category -> Department name
category_department_map = {
    "hostel": "Hostel Department",
    "library": "Library Department",
    "canteen": "Canteen Department",
    "it support": "information technology",
    "classroom": "Academic Department",
    "faculty": "Faculty Affairs",
    "general": "General Administration",
}

def assign_department(category):
    normalized_category = (category or "").strip().lower()

    department_name = category_department_map.get(
        normalized_category,
        "General Administration"
    )

    department = departments_collection.find_one({
        "name": {
            "$regex": f"^{re.escape(department_name)}$",
            "$options": "i"
        }
    })

    if not department:
        return {
            "department_id": None,
            "department_name": department_name,
            "assignment_status": "Unassigned"
        }

    return {
        "department_id": str(department["_id"]),
        "department_name": department["name"],
        "assignment_status": "Assigned"
    }

@app.post("/grievances")
def create_grievance(
    grievance: GrievanceCreate,
    current_student=Depends(get_current_student)
):

    now = utc_now()

    student_id = str(
        current_student["_id"]
    )
    department_assignment = assign_department(
    grievance.category
)

    grievance_data = {

        "title":
            grievance.title,

        "category":
            grievance.category,

        "department_id":
    department_assignment["department_id"],

"department_name":
    department_assignment["department_name"],

"assignment_status":
    department_assignment["assignment_status"],

        "description":
            grievance.description,

        "anonymous":
            grievance.anonymous,

        "student_id":
            student_id,

        "student_name":
            current_student.get(
                "name",
                "Student"
            ),

        "status":
            "Submitted",

        "priority":
            "Pending AI Review",

        "created_at":
            now,

        "updated_at":
            now
    }

    result = grievances_collection.insert_one(
        grievance_data
    )

    grievance_id = str(
        result.inserted_id
    )

    

    # --------------------------------------------------------
    # AUTOMATIC NOTIFICATION
    # --------------------------------------------------------

    notifications_collection.insert_one({

        "user_id":
            student_id,

        "title":
            "Grievance Submitted",

        "message":
            (
                f"Your grievance "
                f"'{grievance.title}' "
                f"has been submitted successfully."
            ),

        "notification_type":
            "grievance_submitted",

        "read":
            False,

        "created_at":
            now
    })

    return {

        "message":
            "Grievance submitted successfully.",

        "grievance_id":
            grievance_id,

        "status":
            "Submitted"
    }

# ============================================================
# CREATE GRIEVANCE WITH OPTIONAL S3 ATTACHMENT
# ============================================================

@app.post("/grievances/with-attachment")
async def create_grievance_with_attachment(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    anonymous: bool = Form(False),
    attachment: UploadFile | None = File(None),
    current_student=Depends(get_current_student),
):
    student_id = str(current_student["_id"])
    now = utc_now()
    department_assignment = assign_department(
    category
)

    attachment_data = None

    if attachment and attachment.filename:
        allowed_types = {
            "image/jpeg",
            "image/png",
            "application/pdf",
        }

        if attachment.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, PNG, and PDF files are allowed.",
            )

        max_size = 5 * 1024 * 1024  # 5 MB

        file_content = await attachment.read(max_size + 1)

        if len(file_content) > max_size:
            raise HTTPException(
                status_code=413,
                detail="Attachment must be 5 MB or smaller.",
            )

        await attachment.seek(0)

        original_name = os.path.basename(attachment.filename)
        extension = os.path.splitext(original_name)[1].lower()

        object_name = (
            f"grievances/{student_id}/"
            f"{uuid.uuid4().hex}{extension}"
        )

        try:
            upload_result = upload_file_to_s3(
                attachment.file,
                object_name,
                attachment.content_type,
            )
        except (BotoCoreError, ClientError) as error:
            print("S3 upload failed:", type(error).__name__)
            raise HTTPException(
                status_code=502,
                detail="Attachment upload failed. Please try again.",
            )
        except Exception as error:
            print("Attachment upload error:", type(error).__name__)
            raise HTTPException(
                status_code=500,
                detail="Could not upload attachment.",
            )

        attachment_data = {
            "bucket": upload_result["bucket"],
            "key": upload_result["key"],
            "region": upload_result["region"],
            "filename": original_name,
            "content_type": attachment.content_type,
            "size": len(file_content),
        }

    grievance_data = {
        "title": title,
        "category": category,
        "department_id": department_assignment["department_id"],
        "department_name": department_assignment["department_name"],
        "assignment_status": department_assignment["assignment_status"],
        "description": description,
        "anonymous": anonymous,
        "student_id": student_id,
        "student_name": current_student.get("name", "Student"),
        "status": "Submitted",
        "priority": "Pending AI Review",
        "created_at": now,
        "updated_at": now,
        "attachment": attachment_data,
    }

    result = grievances_collection.insert_one(grievance_data)

    notifications_collection.insert_one({
        "user_id": student_id,
        "title": "Grievance Submitted",
        "message": (
            f"Your grievance '{title}' "
            "has been submitted successfully."
        ),
        "notification_type": "grievance_submitted",
        "read": False,
        "created_at": now,
    })

    return {
        "message": "Grievance submitted successfully.",
        "grievance_id": str(result.inserted_id),
        "status": "Submitted",
        "attachment_uploaded": attachment_data is not None,
        "attachment_filename": (
            attachment_data["filename"]
            if attachment_data
            else None
        ),
    }

# ============================================================
# GET MY GRIEVANCES
# ============================================================

@app.get("/grievances/me")
def get_my_grievances(
    current_student=Depends(get_current_student)
):

    grievances = grievances_collection.find(
        {
            "student_id":
                str(current_student["_id"])
        }
    ).sort(
        "created_at",
        -1
    )

    grievance_list = []

    for grievance in grievances:

        grievance_list.append({

            "id":
                str(grievance["_id"]),

            "title":
                grievance.get(
                    "title",
                    ""
                ),

            "category":
                grievance.get(
                    "category",
                    ""
                ),

            "description":
                grievance.get(
                    "description",
                    ""
                ),

            "anonymous":
                grievance.get(
                    "anonymous",
                    False
                ),

            "status":
                grievance.get(
                    "status",
                    "Submitted"
                ),

            "priority":
                grievance.get(
                    "priority",
                    "Normal"
                ),

            "created_at":
                grievance.get(
                    "created_at"
                ).isoformat()
                if grievance.get("created_at")
                else None,

            "updated_at":
                grievance.get(
                    "updated_at"
                ).isoformat()
                if grievance.get("updated_at")
                else None,
            "attachment": get_attachment_response(grievance)

                
        })

    return {
        "grievances":
            grievance_list
    }


# ============================================================
# GRIEVANCE STATISTICS
# ============================================================

@app.get("/grievances/stats")
def get_grievance_stats(
    current_student=Depends(get_current_student)
):

    grievances = list(
        grievances_collection.find(
            {
                "student_id":
                    str(current_student["_id"])
            }
        )
    )

    total = len(grievances)

    in_progress = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        in [
            "In Progress",
            "Under Review",
            "Assigned"
        ]
    )

    resolved = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        in [
            "Resolved",
            "Closed"
        ]
    )

    awaiting_response = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        == "Awaiting Student"
    )

    return {

        "total":
            total,

        "in_progress":
            in_progress,

        "resolved":
            resolved,

        "awaiting_response":
            awaiting_response
    }


# ============================================================
# STAFF DASHBOARD
# ============================================================

@app.get("/staff/dashboard")
def staff_dashboard(
    current_user=Depends(
        require_role(
            "staff",
            "manager",
            "admin"
        )
    )
):

    grievances = list(
        grievances_collection.find({})
    )

    total = len(grievances)

    open_cases = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        not in [
            "Resolved",
            "Closed",
            "Rejected"
        ]
    )

    resolved = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        == "Resolved"
    )

    priority_cases = sum(
        1
        for grievance in grievances
        if grievance.get("priority")
        in [
            "High",
            "Critical"
        ]
    )

    return {

        "message":
            "Staff dashboard access granted",

        "user":
            current_user.get("name", ""),

        "role":
            current_user.get(
                "role",
                "staff"
            ),

        "stats": {

            "total":
                total,

            "open":
                open_cases,

            "resolved":
                resolved,

            "priority":
                priority_cases
        }
    }


# ============================================================
# MANAGER DASHBOARD
# ============================================================

@app.get("/manager/dashboard")
def manager_dashboard(
    current_user=Depends(
        require_role(
            "manager",
            "admin"
        )
    )
):

    grievances = list(
        grievances_collection.find({})
    )

    total = len(grievances)

    open_cases = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        not in [
            "Resolved",
            "Closed",
            "Rejected"
        ]
    )

    resolved = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        == "Resolved"
    )

    closed = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        == "Closed"
    )

    return {

        "message":
            "Department manager portal access granted.",

        "user":
            current_user.get("name", ""),

        "role":
            current_user.get(
                "role",
                "manager"
            ),

        "stats": {

            "total":
                total,

            "open":
                open_cases,

            "resolved":
                resolved,

            "closed":
                closed
        }
    }


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@app.get("/admin/dashboard")
def admin_dashboard(
    current_user=Depends(
        require_role("admin")
    )
):

    total_users = students_collection.count_documents({})

    total_students = students_collection.count_documents({
        "role": "student"
    })

    total_staff = students_collection.count_documents({
        "role": "staff"
    })

    total_managers = students_collection.count_documents({
        "role": "manager"
    })

    total_admins = students_collection.count_documents({
        "role": "admin"
    })

    total_grievances = grievances_collection.count_documents({})

    open_grievances = grievances_collection.count_documents({
        "status": {
            "$nin": [
                "Resolved",
                "Closed",
                "Rejected"
            ]
        }
    })

    resolved_grievances = grievances_collection.count_documents({
        "status": "Resolved"
    })

    closed_grievances = grievances_collection.count_documents({
        "status": "Closed"
    })

    return {

        "message":
            "Admin dashboard data",

        "admin": {

            "name":
                current_user.get("name"),

            "email":
                current_user.get("email"),

            "role":
                current_user.get("role")
        },

        "users": {

            "total":
                total_users,

            "students":
                total_students,

            "staff":
                total_staff,

            "managers":
                total_managers,

            "admins":
                total_admins
        },

        "grievances": {

            "total":
                total_grievances,

            "open":
                open_grievances,

            "resolved":
                resolved_grievances,

            "closed":
                closed_grievances
        }
    }


# ============================================================
# ADMIN GRIEVANCES
# ============================================================

@app.get("/admin/grievances")
def get_admin_grievances(
    current_user=Depends(
        require_role("admin")
    )
):

    grievances = list(
        grievances_collection.find({})
        .sort(
            "created_at",
            -1
        )
    )

    result = []

    for grievance in grievances:

        result.append({

            "id":
                str(grievance["_id"]),

            "title":
                grievance.get(
                    "title",
                    ""
                ),

            "category":
                grievance.get(
                    "category",
                    ""
                ),

            "description":
                grievance.get(
                    "description",
                    ""
                ),

            "status":
                grievance.get(
                    "status",
                    "Submitted"
                ),

            "priority":
                grievance.get(
                    "priority",
                    "Normal"
                ),

            "anonymous":
                grievance.get(
                    "anonymous",
                    False
                ),

            "created_at":
                grievance.get(
                    "created_at"
                ),

            "student_id":
                str(
                    grievance.get(
                        "student_id",
                        ""
                    )
                )
        })

    return {

        "grievances":
            result,

        "total":
            len(result)
    }


# ============================================================
# ADMIN / STAFF / MANAGER GRIEVANCE DETAIL
# ============================================================

@app.get("/admin/grievances/{grievance_id}")
def get_admin_grievance_detail(
    grievance_id: str,
    current_user=Depends(
        require_role(
            "staff",
            "manager",
            "admin"
        )
    )
):

    grievance_object_id = object_id_or_400(
        grievance_id
    )

    grievance = grievances_collection.find_one(
        {
            "_id":
                grievance_object_id
        }
    )

    if not grievance:

        raise HTTPException(
            status_code=404,
            detail="Grievance not found."
        )

    return {

        "id":
            str(grievance["_id"]),

        "title":
            grievance.get(
                "title",
                ""
            ),

        "category":
            grievance.get(
                "category",
                ""
            ),

        "description":
            grievance.get(
                "description",
                ""
            ),

        "status":
            grievance.get(
                "status",
                "Submitted"
            ),

        "priority":
            grievance.get(
                "priority",
                "Normal"
            ),

        "anonymous":
            grievance.get(
                "anonymous",
                False
            ),

        "student_id":
            str(
                grievance.get(
                    "student_id",
                    ""
                )
            ),

        "created_at":
            grievance.get(
                "created_at"
            ),

        "submitted_at":
            grievance.get(
                "submitted_at"
            ),
        "attachment":
          get_attachment_response(grievance)
    }


# ============================================================
# UPDATE ADMIN GRIEVANCE
# ============================================================

@app.patch("/admin/grievances/{grievance_id}")
def update_admin_grievance(
    grievance_id: str,
    update_data: GrievanceUpdate,
    current_user=Depends(
        require_role(
            "staff",
            "manager",
            "admin"
        )
    )
):

    allowed_statuses = [

        "Submitted",

        "Under Review",

        "Assigned",

        "In Progress",

        "Awaiting Student",

        "Resolved",

        "Closed",

        "Reopened",

        "Rejected"
    ]

    allowed_priorities = [

        "Low",

        "Normal",

        "High",

        "Critical"
    ]

    if (
        update_data.status is not None
        and update_data.status
        not in allowed_statuses
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid grievance status."
        )

    if (
        update_data.priority is not None
        and update_data.priority
        not in allowed_priorities
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid grievance priority."
        )

    grievance_object_id = object_id_or_400(
        grievance_id
    )

    grievance = grievances_collection.find_one(
        {
            "_id":
                grievance_object_id
        }
    )

    if not grievance:

        raise HTTPException(
            status_code=404,
            detail="Grievance not found."
        )

    changes = {}

    old_status = grievance.get(
        "status",
        "Submitted"
    )

    old_priority = grievance.get(
        "priority",
        "Normal"
    )

    if update_data.status is not None:

        changes["status"] = (
            update_data.status
        )

    if update_data.priority is not None:

        changes["priority"] = (
            update_data.priority
        )

    if not changes:

        raise HTTPException(
            status_code=400,
            detail="No update data provided."
        )

    changes["updated_at"] = utc_now()

    grievances_collection.update_one(
        {
            "_id":
                grievance_object_id
        },
        {
            "$set":
                changes
        }
    )

    
    # --------------------------------------------------------
    # AUDIT LOG: GRIEVANCE UPDATED
    # --------------------------------------------------------

    actual_changes = {}

    if (
        update_data.status is not None
        and update_data.status != old_status
    ):
        actual_changes["old_status"] = old_status
        actual_changes["new_status"] = update_data.status

    if (
        update_data.priority is not None
        and update_data.priority != old_priority
    ):
        actual_changes["old_priority"] = old_priority
        actual_changes["new_priority"] = update_data.priority

    if actual_changes:
        log_audit_action(
            current_user,
            "grievance_updated",
            "grievance",
            grievance_object_id,
            actual_changes
        )


    # --------------------------------------------------------
    # AUTOMATIC STATUS / PRIORITY NOTIFICATION
    # --------------------------------------------------------

    student_id = grievance.get(
        "student_id"
    )

    if student_id:

        notification_messages = []

        if (
            update_data.status is not None
            and update_data.status != old_status
        ):

            notification_messages.append(
                f"Your grievance status has been updated to "
                f"'{update_data.status}'."
            )

        if (
            update_data.priority is not None
            and update_data.priority != old_priority
        ):

            notification_messages.append(
                f"Your grievance priority has been updated to "
                f"'{update_data.priority}'."
            )

        if notification_messages:

            notifications_collection.insert_one({

                "user_id":
                    str(student_id),

                "title":
                    "Grievance Updated",

                "message":
                    " ".join(
                        notification_messages
                    ),

                "notification_type":
                    "grievance_update",

                "read":
                    False,

                "created_at":
                    utc_now()
            })

    updated_grievance = (
        grievances_collection.find_one(
            {
                "_id":
                    grievance_object_id
            }
        )
    )

    return {

        "message":
            "Grievance updated successfully.",

        "grievance": {

            "id":
                str(updated_grievance["_id"]),

            "title":
                updated_grievance.get(
                    "title",
                    ""
                ),

            "status":
                updated_grievance.get(
                    "status",
                    "Submitted"
                ),

            "priority":
                updated_grievance.get(
                    "priority",
                    "Normal"
                ),

            "updated_at":
                updated_grievance.get(
                    "updated_at"
                )
        }
    }


# ============================================================
# UPDATE USER ROLE
# ============================================================

@app.patch("/admin/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role_data: UserRoleUpdate,
    current_user=Depends(
        require_role("admin")
    )
):

    allowed_roles = [

        "student",

        "staff",

        "manager",

        "admin"
    ]

    if role_data.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail="Invalid user role."
        )

    user_object_id = object_id_or_400(
        user_id
    )

    user = students_collection.find_one(
        {
            "_id":
                user_object_id
        }
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if (
        str(user["_id"])
        == str(current_user["_id"])
        and role_data.role != "admin"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "You cannot remove your own admin role."
            )
        )

    students_collection.update_one(
        {
            "_id":
                user_object_id
        },
        {
            "$set": {

                "role":
                    role_data.role,

                "updated_at":
                    utc_now()
            }
        }
    )

        # AUDIT LOG: USER ROLE UPDATED
    if user.get("role", "student") != role_data.role:
        log_audit_action(
            current_user,
            "user_role_updated",
            "user",
            user_object_id,
            {
                "target_email": user.get("email", ""),
                "old_role": user.get("role", "student"),
                "new_role": role_data.role
            }
        )

    updated_user = students_collection.find_one(
        {
            "_id":
                user_object_id
        }
    )

    return {

        "message":
            "User role updated successfully.",

        "user": {

            "id":
                str(updated_user["_id"]),

            "name":
                updated_user.get(
                    "name",
                    ""
                ),

            "email":
                updated_user.get(
                    "email",
                    ""
                ),

            "role":
                updated_user.get(
                    "role",
                    "student"
                )
        }
    }


# ============================================================
# ADMIN USER MANAGEMENT
# ============================================================

@app.get("/admin/users")
def get_admin_users(
    current_user=Depends(
        require_role("admin")
    )
):

    users = list(
        students_collection.find(
            {},
            {
                "_id": 1,
                "name": 1,
                "email": 1,
                "role": 1
            }
        )
    )

    result = []

    for user in users:

        result.append({

            "id":
                str(user["_id"]),

            "name":
                user.get(
                    "name",
                    ""
                ),

            "email":
                user.get(
                    "email",
                    ""
                ),

            "role":
                user.get(
                    "role",
                    "student"
                )
        })

    return {

        "users":
            result,

        "total":
            len(result)
    }


# ============================================================
# ADMIN DEPARTMENTS
# ============================================================

@app.get("/admin/departments")
def get_admin_departments(
    current_user=Depends(require_role("admin"))
):
    departments = list(
        departments_collection.find({})
        .sort("name", 1)
    )

    result = []

    for department in departments:
        result.append({
            "id": str(department["_id"]),
            "name": department.get(
                "name",
                department.get("department_name", "")
            ),
            "description": department.get(
                "description",
                ""
            ),
            "status": department.get(
                "status",
                "Active"
            ),
        })

    return {
        "departments": result,
        "total": len(result)
    }

@app.post("/admin/departments")
def create_admin_department(
    department_data: dict,
    current_user=Depends(require_role("admin"))
):
    name = str(department_data.get("name", "")).strip()
    description = str(
        department_data.get("description", "")
    ).strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Department name is required."
        )

    existing = departments_collection.find_one({
        "name": {
            "$regex": f"^{re.escape(name)}$",
            "$options": "i"
        }
    })

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This department already exists."
        )

    department = {
        "name": name,
        "description": description,
        "status": "Active",
        "created_at": utc_now(),
        "updated_at": utc_now()
    }

    result = departments_collection.insert_one(department)

    log_audit_action(
        current_user,
        "department_created",
        "department",
        result.inserted_id,
        {
            "department_name": name
        }
    )

    return {
        "message": "Department created successfully.",
        "department": {
            "id": str(result.inserted_id),
            "name": name,
            "description": description,
            "status": "Active"
        }
    }

 
@app.get("/admin/audit-logs")
def get_admin_audit_logs(
    current_user=Depends(require_role("admin"))
):
    logs = list(
        audit_logs_collection
        .find({})
        .sort("created_at", -1)
        .limit(200)
    )

    result = []

    for log in logs:
        created_at = log.get("created_at")

        result.append({
            "id": str(log["_id"]),
            "actor_name": log.get("actor_name", "Unknown"),
            "actor_email": log.get("actor_email", ""),
            "actor_role": log.get("actor_role", "unknown"),
            "action": log.get("action", ""),
            "target_type": log.get("target_type", ""),
            "target_id": log.get("target_id"),
            "details": log.get("details", {}),
            "created_at": (
                created_at.isoformat()
                if created_at else None
            )
        })

    return {
        "logs": result,
        "total": len(result)
    }
# ============================================================
# MANAGER GRIEVANCES
# ============================================================

@app.get("/manager/grievances")
def get_manager_grievances(
    current_user=Depends(
        require_role(
            "manager",
            "admin"
        )
    )
):

    grievances = list(
        grievances_collection.find({})
        .sort(
            "created_at",
            -1
        )
    )

    result = []

    for grievance in grievances:

        result.append({

            "id":
                str(grievance["_id"]),

            "title":
                grievance.get(
                    "title",
                    ""
                ),

            "category":
                grievance.get(
                    "category",
                    ""
                ),

            "description":
                grievance.get(
                    "description",
                    ""
                ),

            "status":
                grievance.get(
                    "status",
                    "Submitted"
                ),

            "priority":
                grievance.get(
                    "priority",
                    "Normal"
                ),

            "anonymous":
                grievance.get(
                    "anonymous",
                    False
                ),

            "created_at":
                grievance.get(
                    "created_at"
                ),

            "student_id":
                str(
                    grievance.get(
                        "student_id",
                        ""
                    )
                )
        })

    return {

        "grievances":
            result,

        "total":
            len(result)
    }


# ============================================================
# STAFF GRIEVANCES
# ============================================================

@app.get("/staff/grievances")
def get_staff_grievances(
    current_user=Depends(
        require_role(
            "staff",
            "manager",
            "admin"
        )
    )
):

    grievances = list(
        grievances_collection.find({})
        .sort(
            "created_at",
            -1
        )
    )

    result = []

    for grievance in grievances:

        result.append({

            "id":
                str(grievance["_id"]),

            "title":
                grievance.get(
                    "title",
                    ""
                ),

            "category":
                grievance.get(
                    "category",
                    ""
                ),

            "description":
                grievance.get(
                    "description",
                    ""
                ),

            "status":
                grievance.get(
                    "status",
                    "Submitted"
                ),

            "priority":
                grievance.get(
                    "priority",
                    "Normal"
                ),

            "anonymous":
                grievance.get(
                    "anonymous",
                    False
                ),

            "created_at":
                grievance.get(
                    "created_at"
                ),

            "student_id":
                str(
                    grievance.get(
                        "student_id",
                        ""
                    )
                )
        })

    return {

        "grievances":
            result,

        "total":
            len(result)
    }


# ============================================================
# MANAGER ESCALATIONS
# ============================================================

@app.get("/manager/escalations")
def get_manager_escalations(
    current_user=Depends(
        require_role(
            "manager",
            "admin"
        )
    )
):

    grievances = list(
        grievances_collection.find({

            "priority": {
                "$in": [
                    "High",
                    "Critical"
                ]
            },

            "status": {
                "$nin": [
                    "Resolved",
                    "Closed",
                    "Rejected"
                ]
            }

        }).sort(
            "created_at",
            -1
        )
    )

    result = []

    for grievance in grievances:

        result.append({

            "id":
                str(grievance["_id"]),

            "title":
                grievance.get(
                    "title",
                    ""
                ),

            "category":
                grievance.get(
                    "category",
                    ""
                ),

            "description":
                grievance.get(
                    "description",
                    ""
                ),

            "status":
                grievance.get(
                    "status",
                    "Submitted"
                ),

            "priority":
                grievance.get(
                    "priority",
                    "Normal"
                ),

            "anonymous":
                grievance.get(
                    "anonymous",
                    False
                ),

            "created_at":
                grievance.get(
                    "created_at"
                ),

            "student_id":
                str(
                    grievance.get(
                        "student_id",
                        ""
                    )
                )
        })

    return {

        "escalations":
            result,

        "total":
            len(result)
    }


# ============================================================
# MANAGER SLA
# ============================================================

@app.get("/manager/sla")
def get_manager_sla(
    current_user=Depends(
        require_role(
            "manager",
            "admin"
        )
    )
):

    now = utc_now()

    grievances = list(
        grievances_collection.find({

            "status": {
                "$nin": [
                    "Resolved",
                    "Closed",
                    "Rejected"
                ]
            }

        }).sort(
            "created_at",
            1
        )
    )

    result = []

    for grievance in grievances:

        created_at = grievance.get(
            "created_at"
        )

        if not created_at:
            continue

        if created_at.tzinfo is None:

            created_at = created_at.replace(
                tzinfo=timezone.utc
            )

        age_hours = (
            now - created_at
        ).total_seconds() / 3600

        if age_hours >= 48:

            sla_status = "Overdue"

        elif age_hours >= 36:

            sla_status = "Approaching SLA"

        else:

            sla_status = "Within SLA"

        result.append({

            "id":
                str(grievance["_id"]),

            "title":
                grievance.get(
                    "title",
                    ""
                ),

            "category":
                grievance.get(
                    "category",
                    ""
                ),

            "status":
                grievance.get(
                    "status",
                    "Submitted"
                ),

            "priority":
                grievance.get(
                    "priority",
                    "Normal"
                ),

            "created_at":
                created_at.isoformat(),

            "age_hours":
                round(
                    age_hours,
                    1
                ),

            "sla_status":
                sla_status
        })

    return {

        "sla_cases":
            result,

        "total":
            len(result),

        "overdue":
            sum(
                1
                for item in result
                if item["sla_status"]
                == "Overdue"
            ),

        "approaching":
            sum(
                1
                for item in result
                if item["sla_status"]
                == "Approaching SLA"
            ),

        "within_sla":
            sum(
                1
                for item in result
                if item["sla_status"]
                == "Within SLA"
            )
    }


# ============================================================
# MANAGER REPORTS
# ============================================================

@app.get("/manager/reports")
def get_manager_reports(
    current_user=Depends(
        require_role(
            "manager",
            "admin"
        )
    )
):

    grievances = list(
        grievances_collection.find({})
    )

    total = len(grievances)

    status_counts = {}

    category_counts = {}

    priority_counts = {}

    for grievance in grievances:

        status = grievance.get(
            "status",
            "Submitted"
        )

        status_counts[status] = (
            status_counts.get(
                status,
                0
            ) + 1
        )

        category = grievance.get(
            "category",
            "General"
        )

        category_counts[category] = (
            category_counts.get(
                category,
                0
            ) + 1
        )

        priority = grievance.get(
            "priority",
            "Normal"
        )

        priority_counts[priority] = (
            priority_counts.get(
                priority,
                0
            ) + 1
        )

    open_cases = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        not in [
            "Resolved",
            "Closed",
            "Rejected"
        ]
    )

    resolved = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        == "Resolved"
    )

    closed = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        == "Closed"
    )

    rejected = sum(
        1
        for grievance in grievances
        if grievance.get("status")
        == "Rejected"
    )

    high_priority = sum(
        1
        for grievance in grievances
        if grievance.get("priority")
        in [
            "High",
            "Critical"
        ]
    )

    return {

        "total":
            total,

        "summary": {

            "open":
                open_cases,

            "resolved":
                resolved,

            "closed":
                closed,

            "rejected":
                rejected,

            "high_priority":
                high_priority
        },

        "status_counts":
            status_counts,

        "category_counts":
            category_counts,

        "priority_counts":
            priority_counts
    }


# ============================================================
# CREATE NOTIFICATION
# ============================================================

@app.post("/notifications")
def create_notification(
    notification: NotificationCreate,
    current_user=Depends(
        require_role(
            "staff",
            "manager",
            "admin"
        )
    )
):

    if not ObjectId.is_valid(
        notification.user_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID."
        )

    user = students_collection.find_one(
        {
            "_id":
                ObjectId(
                    notification.user_id
                )
        }
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    notification_data = {

        "user_id":
            notification.user_id,

        "title":
            notification.title,

        "message":
            notification.message,

        "notification_type":
            notification.notification_type,

        "read":
            False,

        "created_at":
            utc_now()
    }

    result = notifications_collection.insert_one(
        notification_data
    )

    return {

        "message":
            "Notification created successfully.",

        "notification_id":
            str(result.inserted_id)
    }


# ============================================================
# GET MY NOTIFICATIONS
# ============================================================

@app.get("/notifications/me")
def get_my_notifications(
    current_user=Depends(
        get_current_student
    )
):

    user_id = str(
        current_user["_id"]
    )

    notifications = list(
        notifications_collection.find(
            {
                "user_id":
                    user_id
            }
        ).sort(
            "created_at",
            -1
        )
    )

    result = []

    for notification in notifications:

        created_at = notification.get(
            "created_at"
        )

        result.append({

            "id":
                str(
                    notification["_id"]
                ),

            "title":
                notification.get(
                    "title",
                    ""
                ),

            "message":
                notification.get(
                    "message",
                    ""
                ),

            "notification_type":
                notification.get(
                    "notification_type",
                    "general"
                ),

            "read":
                notification.get(
                    "read",
                    False
                ),

            "created_at":
                created_at.isoformat()
                if created_at
                else None
        })

    return {

        "notifications":
            result,

        "total":
            len(result),

        "unread":
            sum(
                1
                for notification in result
                if not notification["read"]
            )
    }


# ============================================================
# MARK NOTIFICATION AS READ
# ============================================================

@app.patch(
    "/notifications/{notification_id}/read"
)
def mark_notification_read(
    notification_id: str,
    current_user=Depends(
        get_current_student
    )
):

    if not ObjectId.is_valid(
        notification_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID."
        )

    result = notifications_collection.update_one(
        {

            "_id":
                ObjectId(
                    notification_id
                ),

            "user_id":
                str(
                    current_user["_id"]
                )

        },

        {
            "$set": {
                "read": True
            }
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )

    return {

        "message":
            "Notification marked as read."
    }


# ============================================================
# DELETE NOTIFICATION
# ============================================================

@app.delete(
    "/notifications/{notification_id}"
)
def delete_notification(
    notification_id: str,
    current_user=Depends(
        get_current_student
    )
):

    if not ObjectId.is_valid(
        notification_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID."
        )

    result = notifications_collection.delete_one(
        {

            "_id":
                ObjectId(
                    notification_id
                ),

            "user_id":
                str(
                    current_user["_id"]
                )
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )

    return {

        "message":
            "Notification deleted successfully."
    }
