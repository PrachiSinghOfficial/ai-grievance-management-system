
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
)

def upload_file_to_s3(
    file,
    object_name: str,
    content_type: str = "application/octet-stream",
):
    if not S3_BUCKET_NAME:
        raise RuntimeError("S3_BUCKET_NAME is missing in .env")

    s3_client.upload_fileobj(
        file,
        S3_BUCKET_NAME,
        object_name,
        ExtraArgs={"ContentType": content_type},
    )

    return {
        "bucket": S3_BUCKET_NAME,
        "key": object_name,
        "region": AWS_REGION,
    }
def generate_presigned_url(object_name: str, expires_in: int = 3600):
    if not S3_BUCKET_NAME:
        raise RuntimeError("S3_BUCKET_NAME is missing in .env")

    return s3_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": S3_BUCKET_NAME,
            "Key": object_name,
        },
        ExpiresIn=expires_in,
    )
