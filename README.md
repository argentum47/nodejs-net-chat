### Line

No Magic, uses UDP to connect to users on a LAN

Setup
---------
- `npm install -g electron`
- `npm install`
- `npm run app`

Using the app
----------------
** caution: shitty ui ahead **

You could set an username, but it will always be prefixed with a number (for uniqueness sake, and I am dumb), Or just click on Proceed

Select an user, enter some message, click send.

The White Space of the right, where your messages appearm that's not a room, coz this is not slack

Untested: Possibly u can read messages from multiple users

Internals
----------------

The App is simple (kidding). Uses UDP, (why because TCP is painful).
Used DHT to keep a track of online users (Distributed Hash Table, but not the one used by bitorrent, this is a trimmed down version, has no bucket splitting)

When an user joins, He/She broadcasts his grand arrival on a PORT using the broadcast ip, and other online users are listening.

Upon arrival online users send their list of online users (serialized DHT), and hence you get the list of online users. (potential attack by flood, is possible, need to think)

And then you setup a server on PORT 5000 that listens to incomming messages and a client to send messages on PORT 5000

The broadcast client,server,port can be changed (AT YOUR OWN RISK, or if its needed)

On initiation of a chat, both users generate a private key and share their public key and together agree on a shared secret, (basic DiffeHelman key exchange),

The shared secret is used for encrypting with `aes-256-cbc`. (Wish to improve on this, by using a long term and session keys).

The corresponding keys are stored inmemory in an object, and hopefully you can decrypt other's messages.
