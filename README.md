# Club Chess

## What the project does
This is an full stack MERN application, built as my final project for the February 2018 UNC Coding Boot Camp. When fully built-out, it will provide the infrastructure for a local chess club, providing both on-line chess and support for various club activities. At the moment, it provides an on-line chess game that can be played by two remote clients, a member directory, and a page that each player can user to edit his or her entry in the directory.

Here is a screen capture of a chess game in progress.

![Screen cap of game](/readme_img/game.png)

## How to get started with the app
The app is available on [Heroku](https://chessclub42.herokuapp.com/login) or you can download it. This discussion assumes that you'll enjoy it on Heroku. Be aware that the app may be a little slow to load while Heroku spins up a virtual machine to host it.

Once the app loads, you will be presented with a log-in page. You will need to register first, and then log in. Once logged in, you will enter the club lobby. From here, you can access all the features of the application.

If you select chess, you will be placed in the game room, as shown in this screen capture.

![Screen cap of game room](/readme_img/game_room.png)


If others are in the room, you will see buttons corresponding to each player who is looking for a game. Click one, and you will be placed in a game as white; the other player will play as black. The game also has a simple chat application for the two players to use as they play.

The app currently is not smart enough to know when a game is over. When one player has won or decides to resign the game, a player can click the 'Game Over/Resign' button and the game will end. It's also possible to log out from the game, ending it. If your page reloads for whatever reason, the app will place you back in the game room, and your game will be lost.

## Technologies and user interface design
In addition to using Mongo, Express, React, and Node as well as Axios throughout, the following packages are key in providing the app's features:

- Passport, Bluebird, and JSON Web Tokens for authentication
- Chessboardjsx and Chess.js for the chess client
- Sockets.io for real-time communication between the clients, for both chess and chat.

The user interface is intentionally kept spare to focus club members' attention on the content and functionality of the page. 

## Author
This app was built and will be maintained by Mark Hainline. Help beyond this README should not be needed, and will not be available.
