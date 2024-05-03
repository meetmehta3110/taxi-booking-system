# dont start the server first .

# first change this variable value in config.env file if not exits the create and add this variable

# Note -> without stripe user Cant register

# Default environment variables change as per your recurment

LOCATION_DB_URI=mongodb://localhost:27017/NEW_PRODUCT
JWT_SECRET=YOUR_SECRET_TOKEN
ENCRYPTION_KEY=YOUR_SECRET_KEY
PORT=8000
GOOGLE_CLIENT_ID=YOUR_SECRET_TOKEN
DEFAULT_LANGUAGE=en

# default admin id and passoerd

USERNAME=admin
EMAIL=admin@1234
PASSWORD=123456
PHONE=9904593980
PHONECODE=+91
isApprove=1

# chane for live to https

PROTOCOL=http

DEFAULT_IMAGE_FOLDER=uploads
PAYMENT_SUCCESS_URL=https://images.ctfassets.net/fzn2n1nzq965/6JEjxpwMd1OIIk6RosReNU/3d5c5f5217a7cce4af750ebfe599b6fc/Payments-social-card.png?q=80
PAYMENT_CANCEL_URL=https://cdn.dribbble.com/users/318828/screenshots/6521954/15_payment-error.jpg?compress=1&resize=400x300

# end env

-> run npm i command

-> for stripe add webhuk in stripe dashboard https://yourdomainname/stripe/webhook without stripe user Cant register
add two event
checkout.session.completed
invoice.payment_succeeded
