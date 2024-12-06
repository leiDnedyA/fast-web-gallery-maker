import requests
import datetime
import jwt
import dotenv
import os
from src import gh_api
from flask import Flask, Response, redirect, request
from flask_cors import CORS, cross_origin

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def ping():
    return "<p>Ping</p>"

@app.route("/auth")
def auth_redirect():
    return redirect(gh_api.oauth_url, code=302)

@app.route("/gh_token")
@cross_origin()
def create_user_token():
    code = request.args.get("code")
    if not code:
        return Response("Missing query param 'code'", 400)
    return {"access_token": gh_api.create_user_token(code)}

@app.route("/gh_username")
@cross_origin()
def get_gh_username():
    auth_header = request.headers.get("authorization")
    if not auth_header or len(auth_header.split(" ")) < 2:
        return Response("Missing auth header", status=401)
    gh_token = auth_header.split(" ")[1]
    return {"github_username": gh_api.get_gh_username(gh_token)}


@app.post("/create_github_pages")
@cross_origin()
def create_github_pages():
    # Step 1: Get the html file, repo name, and github token attached to the request
    auth_header = request.headers.get("authorization")
    if not auth_header or len(auth_header.split(" ")) < 2:
        return Response("Missing auth header", status=401)
    gh_token = auth_header.split(" ")[1]

    html_file = None
    try:
        html_file = request.files["html_file"]
        if not html_file:
            raise Exception("Missing HTML file")
    except:
        return Response("Missing formdata file 'html_file'")

    repo_name = None
    try:
        repo_name = request.form["repo_name"]
        if not repo_name:
            raise Exception("Missing repo_name")
    except:
        return Response("Missing formdata field 'repo_name'")

    # Step 2: Create the repo
    gh_api.create_repo(gh_token, repo_name)

    # Step 3: Push the code in the file to the repo

    # Step 4: Create the github pages site
    # Step 5: response with the gh pages site link
    return ""
