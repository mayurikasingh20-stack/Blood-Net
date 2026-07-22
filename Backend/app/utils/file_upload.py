import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {
    "pdf",
    "png",
    "jpg",
    "jpeg"
}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_uploaded_file(file, folder_name):
    if file is None:
        return None

    if file.filename == "":
        return None

    if not allowed_file(file.filename):
        raise ValueError(
            "Only PDF, PNG, JPG and JPEG files are allowed."
        )

    filename = secure_filename(file.filename)
    extension = filename.rsplit(".", 1)[1]

    unique_name = f"{uuid.uuid4()}.{extension}"

    upload_folder = os.path.join(
        current_app.config["UPLOAD_FOLDER"],
        folder_name
    )

    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(
        upload_folder,
        unique_name
    )

    file.save(file_path)

    return os.path.join(
        folder_name,
        unique_name
    )


def delete_uploaded_file(file_path):
    """
    Delete an uploaded file if it exists.
    """

    if not file_path:
        return

    full_path = os.path.join(
        current_app.config["UPLOAD_FOLDER"],
        file_path
    )

    if os.path.exists(full_path):
        os.remove(full_path)