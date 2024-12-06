from typing import TypedDict
import time
import requests
from urllib.parse import parse_qs
import os

GH_BASE_URL="https://api.github.com"

GH_PRIVATE_KEY=os.environ["GITHUB_CLIENT_SECRET"]
GH_APP_ID=os.environ["GITHUB_CLIENT_ID"]

assert GH_PRIVATE_KEY
assert GH_APP_ID

oauth_url = f"https://github.com/login/oauth/authorize?client_id={GH_APP_ID}"

def create_user_token(code: str) -> str:
    response = requests.post(f"https://github.com/login/oauth/access_token?client_id={GH_APP_ID}&client_secret={GH_PRIVATE_KEY}&code={code}")
    if not response.ok:
        raise Exception("Failed to generate GitHub user token")
    data = parse_qs(response.text)
    access_token_list = data.get("access_token")
    print(data)
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

    

def create_repo(token: str, repo_name: str):
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
        "X-GitHub-Api-Version": "2022-11-28"
    }
    response = requests.post(f"{GH_BASE_URL}/user/repos", headers=headers, data={
        "name": repo_name,
        "description": "This is a repo created using Fast Web Gallery Maker!",
        "private": True})
    print(response.json())
