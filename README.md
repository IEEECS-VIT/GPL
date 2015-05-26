graVITas Premier League
=======================

[![Join the chat at https://gitter.im/IEEECS-VIT/GPL](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/IEEECS-VIT/GPL?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The graVITas Premier League code repository

This website is hosted [here](http://www.gravitaspremierleague.com)

Please report any bugs or issues [here](https://github.com/IEEECS-VIT/GPL/issues) 

#### Instructions for Installation:
###### Install Node.js 0.12.x
###### Install the latest version of MongoDB
###### Install all dependencies

    $ npm install
    
###### Install security dependency manually (Microsoft Windows only)

    # npm install bcryptjs
        
###### Run the server locally at port 3000 or "PORT" in process.env

    $ npm start
    
#### External Requirements:
* A MongoDB instance running locally or valid "MONGOLAB_URI"/"MONGOHQ_URI" string in process.env 
* A valid "COOKIE_SECRET" string in process.env for better security (Optional)
* A valid "LOGENTRIES_TOKEN" in process.env for Logentries support (Optional)
* A valid "NEWRELIC_APP_NAME" and "NEWRELIC_LICENSE" in process.env for New Relic support (Optional)