# Virtue
Virtue is a webRTC based video chat website. It has features like blur video, screen share, test chat, invite friends and a very unique feature God's eye. God's eye work with multiple webcams and it automatically captures your stream from the webcam you are looking into. Tensorflow machine learning model "Face landmark detection" is used to implement God's eye. As soon as the God's eye is turned on, it starts mapping the user's face from every camera, connected to the device. So when a user look towards a particular camera, God's eye starts broadcasting the stream from that camera only.

For blur eye also, "Body pix" tensorflow model is used which perform real-time person segmentation in the browser.

Virtue is made in django on the backend side and HTML, CSS and Javascript on the frontend side. The website is rendered server side.

# Steps to run the code locally
    - First create the virtual env using the requirements.txt file
    - Run the redis server on your computer on port 6379
    - makemigrations using the command "python manage.py makemigrations"
    - python manage.py migrate
    - Run server using python manage.py runserver

# Extra steps to deploy the website
    - Setup a nginx server to run your django project on.
    - Setup a daphne server on your machine which would be taking care of your websockets long lasting requests.
    - Setup a coturn server which would help to stream the user's video if he/she's system is behind a firewall.

# Limits of the project
    - I am not sure about the upper cap of people that join the meeting but I have tested it for maximum 5 people and it worked fine.
    - The website is currently for screen size greater than 12 inches.

# Error log on aws

    - cat /var/log/gunicorn/gunicorn.err.log
    - cat /var/log/gunicorn/gunicorn.out.log

# On changes to code How to update AWS

    $ sudo service nginx restart
    $ sudo supervisorctl reload

# To restart daphne server
    $ sudo systemctl daemon-reload
    $ sudo systemctl stop daphne.service
    $ sudo systemctl start daphne.service

# Error log of daphne
    sudo journalctl -u daphne.service
    
# Video demo of the project
    https://youtu.be/41kHOH46oRA

# References
    - https://blog.tensorflow.org/2019/11/updated-bodypix-2.html
    - https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection
    - https://www.youtube.com/watch?v=MBOlZMLaQ8g
    - https://tobiasahlin.com/moving-letters/

    $ For deploying
    - https://github.com/mitchtabian/HOWTO-django-channels-daphne
    - https://kostya-malsev.medium.com/set-up-a-turn-server-on-aws-in-15-minutes-25beb145bc77
