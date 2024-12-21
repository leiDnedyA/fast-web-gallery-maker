# [Fast Gallery Maker](https://aydend.pythonanywhere.com/)
Fast gallery maker allows you to create and host a 3D art gallery **for free**!

## Where can I try it?
[The site is hosted here!](https://aydend.pythonanywhere.com/)

## How do I run it?
The app is broken up into two parts, the **frontend** and the **backend**. Both need to be run separately:

### Frontend
Make sure that you're `cd`'ed into the root directory of this git repo, and then run the following commands
```bash
npm install
npm run dev
```

These two commands are sufficient to run the frontend in developer mode 👍 Now, visit [http://localhost:5173/](http://localhost:5173/) to use the app.

With just the frontend, you'll be able to create galleries and export the code as an `index.html` file, which you can test by simply opening the file in a browser (no web server required!).

### Backend (optional)
The backend is optional as it only handles the GitHub integration. To set it up, first you have to create a GitHub app to use with the API, which is pretty complicated. I would recommend just running the frontend locally if you're simply testing the code.

If you do want to run the backend, first [follow the steps here](https://docs.github.com/en/apps/creating-github-apps) to create your GitHub app.

After you create your GitHub app, create a file `backend/.env`, with the following values
```
GITHUB_CLIENT_ID=your gh app's client ID
GITHUB_CLIENT_SECRET=your gh app's client secret
```

Next, issue the following commands to run the backend:
```bash
cd backend

# optional: create a python virtual environment
python3 -m venv venv 
source venv/bin/activate # if you're on windows, issue the command `venv\Scripts\activate` instead

pip3 install -r requirements.txt

flask --app main run
```

If you've correctly followed the steps above, you should be able to use all features of the app, including **GitHub Integration**!
