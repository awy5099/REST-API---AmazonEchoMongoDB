git add .
git commit -m "updated rest api"
git push
git push heroku master
heroku ps:scale web=1