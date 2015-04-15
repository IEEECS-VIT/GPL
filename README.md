graVITas Premier League
=======================

The graVITas Premier League code repository

This website is hosted [here](http://www.gravitaspremierleague.com/)

Please report any bugs or issues [here](https://github.com/IEEECS-VIT/GPL/issues) 

#### Instructions for Installation:
###### Install Node.js 0.12.x
###### Install all dependencies

    $ npm install
    
###### Install frontend dependencies manually (Microsoft Windows only)
The npm postinstall script to run bower may not work properly on Windows, see [this issue](https://github.com/IEEECS-VIT/GPL/issues/13)

    # npm -g install bower
    $ bower install
    
###### Run the server locally at port 3000 or "PORT" in process.env

    $ npm start
    
#### External Requirements:
* A MongoDB instance running locally or valid "MONGOLAB_URI"/"MONGOHQ_URI" string in process.env 
* A valid "COOKIE_SECRET" string in process.env for better security (Optional)
* A valid "LOGENTRIES_TOKEN" in process.env for Logentries support (Optional)
* A valid "NEWRELIC_APP_NAME" and "NEWRELIC_LICENSE" in process.env for New Relic support (Optional)
