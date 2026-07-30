from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET = "cvs"

def upload_cv(file_bytes: bytes, file_name: str, content_type: str = "application/pdf") -> str:
    # Upload a CV to Supabase Storage and return the storage path.

    path = f"{file_name}"

    supabase.storage_from(BUCKET).upload(
        path,
        file_bytes,
        {"content-type": content_type, "upsert": "True"}
    )
    return path

def get_cv_signed_url(path: str, expires_in: int = 36000) -> str:
     # Generate a signed URL for a CV file valid for 1 hour.

     res = supabase.storage_from(BUCKET).create_signed_url(path, expires_in)

     return res["signedURL"]

def delete_cv(path: str) -> None:
    # Delete a CV from Supabase Storage.

    supabase.storage.from_(BUCKET).remove([path])