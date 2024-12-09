import json
import base64
from typing import TypedDict
import requests
from urllib.parse import parse_qs
import os

GH_BASE_URL="https://api.github.com"

GH_PRIVATE_KEY=os.environ["GITHUB_CLIENT_SECRET"]
GH_APP_ID=os.environ["GITHUB_CLIENT_ID"]

assert GH_PRIVATE_KEY
assert GH_APP_ID

oauth_url = f"https://github.com/login/oauth/authorize?client_id={GH_APP_ID}&scope=repo,pages"

def create_user_token(code: str) -> str:
    response = requests.post(f"https://github.com/login/oauth/access_token?client_id={GH_APP_ID}&client_secret={GH_PRIVATE_KEY}&code={code}")
    if not response.ok:
        raise Exception("Failed to generate GitHub user token")
    data = parse_qs(response.text)
    access_token_list = data.get("access_token")
    if not access_token_list:
        raise Exception("Failed to generate GitHub user token")
    return access_token_list[0]

def get_gh_username(token: str) -> str:
    """
    curl -L \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer <YOUR-TOKEN>" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/user
    """
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    response = requests.get(f"{GH_BASE_URL}/user", headers=headers)
    if not response.ok:
        raise Exception("Unable to get GH user data.")
    data = response.json()
    return data["login"]

class RepoData(TypedDict):
    full_repo_name: str
    default_branch: str

def create_repo(token: str, repo_name: str) -> RepoData:
    """
    Mimics the following request:
    ```bash
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer <YOUR-TOKEN>" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/user/repos \
      -d '{"name":"Hello-World","description":"This is your first repo!","homepage":"https://github.com","private":false,"is_template":true}'
    ````
    """
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
    }
    response = requests.post(f"{GH_BASE_URL}/user/repos", headers=headers, data=json.dumps({
        "name": repo_name,
        "description": "This is a repo created using Fast Web Gallery Maker!",
        "private": False}))
    data = response.json()
    return {"full_repo_name": data["full_name"], "default_branch": data["default_branch"]}

"""Repo name should be in the format "owner/name" """
def commit_file(token: str, full_repo_name: str, file_contents: str, file_name: str):
    """
curl -L \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/contents/PATH \
  -d '{"message":"my commit message","committer":{"name":"Monalisa Octocat","email":"octocat@github.com"},"content":"bXkgbmV3IGZpbGUgY29udGVudHM="}'
    """
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
    }

    encoded_contents = base64.b64encode(file_contents.encode('utf-8'))
    json_data = json.dumps({
        "message": "Pushed to GitHub using Fast 3D Gallery Maker!", "content": encoded_contents.decode('utf-8')})
    url = f"{GH_BASE_URL}/repos/{full_repo_name}/contents/{file_name}"
    response = requests.put(url, headers=headers, data=json_data)

    if not response.ok:
        print(response.text)
        raise Exception("Unable to commit file to github.")


def create_gh_pages(token: str, full_repo_name: str, branch: str):
    """
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/pages \
  -d '{"source":{"branch":"main","path":"/docs"}}'
    """
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = f"{GH_BASE_URL}/repos/{full_repo_name}/pages"
    response = requests.post(url, headers=headers, data=json.dumps({"source": {"branch": branch}}))

    if not response.ok:
        print(branch)
        print(response.text)
        raise Exception("Unable to create gh pages.")

    response = requests.get(url, headers=headers)

    if not response.ok:
        print(response.text)
        raise Exception("Unable to get gh pages after publishing.")
    data = response.json()
    return data["html_url"]

def test_access_token(token: str) -> bool:
    headers = {
        "Authorization": f"Bearer {token}",
    }
    url = "https://api.github.com/user/installations"
    response = requests.get(url, headers=headers)
    data = response.json()
    if not data["total_count"]:
        return False
    return True
