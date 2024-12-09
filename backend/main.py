import requests
import datetime
import jwt
import dotenv
import os
from src import gh_api
from flask import Flask, Response, redirect, request, send_from_directory
from flask_cors import CORS, cross_origin

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def ping():
    return send_from_directory('static', 'index.html')

@app.route("/ping_site")
@cross_origin()
def ping_pages_site():
    url = request.args.get("url")
    if not url:
        return Response("missing query param 'url'", 400)
    response = requests.get(url)
    return {"ok": response.ok}

@app.route("/auth")
def auth_redirect():
    mode = request.args.get("mode")
    print(mode)
    final_redirect_uri = "https://aydend.pythonanywhere.com/" if mode == "production" else "http://localhost:5173/"
    gh_auth_url = f"{gh_api.oauth_url}&redirect_uri={final_redirect_uri}"
    print(gh_auth_url)

    return redirect(gh_auth_url, code=302)

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
        return Response("Missing formdata file 'html_file'", status=400)

    repo_name = None
    try:
        repo_name = request.form["repo_name"]
        if not repo_name:
            raise Exception("Missing repo_name")
    except:
        return Response("Missing formdata field 'repo_name'", status=400)

    # Step 2: Create the repo
    full_repo_name = None
    default_branch = None
    try:
        repo_data = gh_api.create_repo(gh_token, repo_name)
        full_repo_name= repo_data["full_repo_name"]
        default_branch= repo_data["default_branch"]
    except:
        return Response("Unable to create repo.", status=500)

    # Step 3: Push the code in the file to the repo
    try:
        html_content = html_file.read().decode('utf-8')
        gh_api.commit_file(gh_token, full_repo_name, html_content, "index.html")
    except:
        return Response("Unable to push HTML to repo.", status=500)

    # Step 4: Create the github pages site
    gh_pages_url = gh_api.create_gh_pages(gh_token, full_repo_name, default_branch)

    # Step 5: response with the gh pages site link
    return {"url": gh_pages_url}

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

