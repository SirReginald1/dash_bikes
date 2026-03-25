import os
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
# from pydantic import BaseModel # Use if automatic formatting validation is needed


THIS_FILE_PATH = Path(os.path.dirname(__file__))


BUILT_DIRECTORY = THIS_FILE_PATH / ".." / "frontend" / "dist"


SERVED_DATA_FILE_PATH = THIS_FILE_PATH / "data" / "accidentsVelo.json"


AUTHORIZED_ORIGINS = ["*"]


AUTHORIZED_METHODS = ["GET"]


AUTHORIZED_HEADERS = ["*"]


# Stand in for main website application
app = FastAPI(title="stand-in for main app")


app.add_middleware(
    CORSMiddleware,
    allow_origins=AUTHORIZED_ORIGINS,
    allow_credentials=False,
    allow_methods=AUTHORIZED_METHODS,
    allow_headers=AUTHORIZED_HEADERS,
)


bike_accident_dashboard = FastAPI(title="Bike accidents dashboard")


bike_accident_dashboard.add_middleware(
    CORSMiddleware,
    allow_origins=AUTHORIZED_ORIGINS,
    allow_credentials=False,
    allow_methods=AUTHORIZED_METHODS,
    allow_headers=AUTHORIZED_HEADERS,
)


bike_accident_dashboard.mount(
    "/assets",
    StaticFiles(directory=BUILT_DIRECTORY / "assets"),
    name="assets"
)


app.mount(
    "/dash_bikes",  # The root of the dash_bikes app
    bike_accident_dashboard
)


@app.get("/")
async def serve_bikes_accident_dashboard():
    return {"message": "This is the main website. Add /dash_bikes to url to get dashboard."}

# This is the path for this particular page in the dash_bikes sub app.
# full_path:path and full_path: str catch any extras on the end of the url.
@bike_accident_dashboard.get("/") #{full_path:path} ; full_path: str
async def serve_dashboard_app():
    """Function that returns the bike accidents dashboard.
    
    Returns:
        - FileResponse: The files representing the home page.
        OR
        - dict: If the index.html file can not be found.
    """

    # TODO: Change this path for production
    index_file = BUILT_DIRECTORY / "index.html"
    # print(f"Debug filename: \n{index_file}")
    # print(f"Debug path exists: \n{index_file.exists()}")
    if index_file.exists():
        return FileResponse(index_file)
    return {"error": "index.html not found."}


# Remember to 
@bike_accident_dashboard.get("/data")
def serve_dashboard_data():
    """Serves all data needed for the dashboard."""

    with open(SERVED_DATA_FILE_PATH, "r") as data_file:
        data = json.load(data_file)
        data_file.close()
    return data


if __name__ == "__main__":
    index_file = BUILT_DIRECTORY / "index.html"
    # print(f"Debug filename: \n{index_file}")
    # print(f"Debug path exists: \n{index_file.exists()}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        #reload=True,  # Reload each time file is saved
    )
