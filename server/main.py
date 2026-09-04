from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI(title="Dunkk API")

origins = [
    "http://localhost:5173","http://localhost:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

v1 = APIRouter(prefix="/api/v1")

class ApiBody(BaseModel):
    requestMethod: str
    requestUrl: str
    requestBody: str | None
    requestParams: list[dict] | None
    requestHeaders: list[dict] | None

def forwardRequest(externalApiBody: ApiBody):
    requestMethod = externalApiBody.requestMethod
    requestUrl = externalApiBody.requestUrl
    requestBody = externalApiBody.requestBody
    requestParams = externalApiBody.requestParams
    requestHeaders = externalApiBody.requestHeaders

    headers = {h["key"]: h["value"] for h in (requestHeaders or []) if h.get("key")}
    params = {p["key"]: p["value"] for p in (requestParams or []) if p.get("key")}

    response = requests.request(
        method=requestMethod,
        url=requestUrl,
        headers=headers,
        params=params,
        data=requestBody,
    )
    return response


@v1.get("/test")
def get_data():
    return {"message": "Hello from the backend!"}


@v1.post("/")
def get_dataa(request: ApiBody):
    response = forwardRequest(request)
    print(response)
    return {
        "status": response.status_code,
        "headers": list(response.headers.items()),
        "text": response.text,
    }


app.include_router(v1)
