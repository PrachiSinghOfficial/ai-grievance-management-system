
from io import BytesIO
from cloud_storage import upload_file_to_s3

test_file = BytesIO(b"CampusResolve S3 connection test")
result = upload_file_to_s3(
    test_file,
    "test/campusresolve-test.txt",
    "text/plain",
)

print("S3 upload successful!")
print(result)
