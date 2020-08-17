# Albert Bot

A Discord bot for the CS @ NYU discord server that utilizes [BUGS NYU's Schedge](https://github.com/BUGS-NYU/schedge) to provide NYU course search results as well as many other things.

## Getting Started

### Register an app with discord

Register a discord application [here](https://discord.com/developers/applications) and create a bot for your application.

Put the token and client id in your `.env` file.

### Download the most up to date packages

Run the following commands to download the node modules required for this project

```sh
cd Albert-Bot
yarn
```

### Add the bot to a dev server

Visit the following link using the client id you pulled from earlier.

`https://discord.com/oauth2/authorize?client_id=<YOUR_CLIENT_ID>&scope=bot`

### Start up the bot

Run the following commands to start up the bot locally

```sh
# Run once
yarn start

# Run forever and watch for local file changes
yarn dev
```
