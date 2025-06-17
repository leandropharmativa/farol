import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Carrega credenciais do JSON salvo na variável de ambiente
def get_drive_service():
    credentials_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if not credentials_json:
        raise Exception("Variável de ambiente GOOGLE_CREDENTIALS_JSON não configurada")

    credentials = service_account.Credentials.from_service_account_info(
        json.loads(credentials_json),
        scopes=["https://www.googleapis.com/auth/drive"]
    )

    return build("drive", "v3", credentials=credentials)


def upload_arquivo_para_drive(caminho_arquivo_local, nome_arquivo):
    folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    if not folder_id:
        raise Exception("Variável GOOGLE_DRIVE_FOLDER_ID não configurada")

    service = get_drive_service()

    file_metadata = {
        "name": nome_arquivo,
        "parents": [folder_id]
    }

    media = MediaFileUpload(caminho_arquivo_local, resumable=True)
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id, webViewLink"
    ).execute()

    return file["id"], file["webViewLink"]
