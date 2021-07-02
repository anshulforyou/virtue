# engage
 
The main function that is creating the peer connection and add the media devices input to the peer connection is connectSender

When a peer try to connect to another peer then they create a description called offer where they send their end of information to the other peers. After the other peer receive the offer, they send a description called answer in which they share their end of details. 

The description includes information about the kind of media being sent, its format, the transfer protocol being used, the endpoint's IP address and port, and other information needed to describe a media transfer endpoint. This information is exchanged and stored using Session Description Protocol (SDP);

# createOfferer
When the main video conf page is opened then in the connect.js file, we first extract the endpoint that helps to connect to the websocket. Then on that websocket,we send a "new-join" signal. The websocketManager receive the signal and calls the createOfferer function. In the createOfferer function, we send the username and receiver_channel_name. Here we create the RTCPeerConnection and add media inputs to it. Then we form a data channel and add message event listener to it.
We use the createVideo function to create the video element on the main screen.
We store all the peer datas in peerIndex dictionary.
We also add an event listener to iceconnectstatechange, it helps to inform the program when a particular user leaves the call.

# createReceiver
Then we add an icecandidate event listener which send the 'new-offer' message to the existing peers. Along with 'new-offer' message, peers local description as sdp and channel name is sent.
Here in the icecandidate event listener, the peer send its local description as answer and set the coming description as it's localdescription.

So basically a peer has his sdp as local description and other peer's sdp as remote description.

Local description - This description specifies the properties of the local end of the connection, including the media format. The method takes a single parameter—the session description—and it returns a Promise which is fulfilled once the description has been changed, asynchronously.

Remote description - The RTCPeerConnection method setRemoteDescription() sets the specified session description as the remote peer's current offer or answer. The description specifies the properties of the remote end of the connection, including the media format. The method takes a single parameter—the session description—and it returns a Promise which is fulfilled once the description has been changed, asynchronously.

# My implementation
In my engage app, there are meeting rooms where every user has an username. In a particular room, two users cannot have same username.

self.channel_layer.group_send send the message to all the channels(users) in the group

The message sent by send_sdp function in consumer.py is what received by websocketManager

# error on aws

    - cat /var/log/gunicorn/gunicorn.err.log
    - cat /var/log/gunicorn/gunicorn.out.log

# On changes to code How to update AWS

    $ sudo service nginx restart
    $ sudo supervisorctl reload