# Counting
A highly customizable counting bot created by [numselli](https://github.com/numselli/).

[Privacy Policy](https://counting.numselli.xyz/privacy) - [Support Server](https://counting.numselli.xyz/support)


## Before you continue (Notice on Open Source status of Counting)
The code in this repository contains a slimmed down version of my [counting bot](https://counting.numselli.xyz/). This version of the bot is intended to be used in a small number of guilds and has some functionality removed most notably:
- Voting to earn saves
- Website
- API
- All [premium](https://counting.numselli.xyz/premium) features

There are two important expectations to set for self-hosting this bot:
- Expect limited support in the support server due to the complexities of self-hosting.
- Expect braking changes in all releases. I will try to minimize breaking changes, but I am primarily focusing on the main bot where I have full control over the effects of my changes.  

Using this code for personal use is acceptable however monetizing this project is not, if you do wish to monetize this code please reach out to me on discord (`numselli#6964`).
If you would like to give back to the project consider making a pull request, [donating](https://www.paypal.com/paypalme/numselli), or [subscribing to a premium plan](https://counting.numselli.xyz/premium).

\- numselli Counting Maintainer

## Installing and Setup
The following steps will help you get Counting up and running on your computer.
1. Install Prerequisites
    - Install [Docker](https://docs.docker.com/engine/install/) and [Docker compose](https://docs.docker.com/compose/install/)
    - Clone this repository to the system you want to run the bot
        ```
        git clone https://github.com/counting-bot/bot.git
        ```
    - [Create a new discord bot](https://www.xda-developers.com/how-to-create-discord-bot/#how-to-create-and-add-a-discord-bot-to-your-server). **Make sure you have MESSAGE CONTENT INTENT under Privileged Gateway Intents enabled.**
2. Create docker volumes
    1. Make two directories
        - static
        - database
        - cache
    2. Modify and run the following three commands
        -   ```
            docker volume create --driver local \
            --opt type=non \
            --opt o=bind\
            --opt device=/<PATH OF STATIC DIR>\
            CountingStatic
            ```
        -   ```
            docker volume create --driver local \
            --opt type=non \
            --opt o=bind\
            --opt device=/<PATH OF DATA BASE DIR>\
            CountingDB
            ```
         -  ```
            docker volume create --driver local \
            --opt type=non \
            --opt o=bind\
            --opt device=/<PATH OF CACHE DIR>\
            cache
            ```
3. Copy and edit the config file
    - Copy `settings.example.mjs` into the static folder that you made in step 2
    - Replace `726515812361437285` with your discord userid
    - Replace `TOKEN_HERE` with the discord bots token
4. Run the bot
    - Open this repository in a terminal of your choosing and run
    ```
    sudo docker-compose up -d
    ```
5. Invite the bot to your server using this link (remember to replace `726560538145849374` with your bot's id) `https://discord.com/oauth2/authorize?client_id=726560538145849374&permissions=3136&scope=bot%20applications.commands`
6. Link a counting channel using the `/linkchannel` command

## License
This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.