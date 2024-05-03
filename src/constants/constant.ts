export enum SERVICES {
  Twillo = 1,
  Whatsapp = 2,
  Payment = 3,
  Min_services = 1,
  Max_services = 1,
  Inc_Usage = 1,
}

export enum MESSAGE {
  Registration_successfully = "Registration_Successfully 😀",
  Email_already_exists = "Email_already_exists 🤬",
  Phone_already_exists = "Phone_already_exists 🤬",
  Internal_server_error = "Internal server error 🤬",
  User_not_found = "User not found 🤬",
  Login_successful = "Login successful 😀",
  Youre_unapproved = "You're Unapproved 🤬",
  Invalid_password = "Invalid password 🤬",
  Invalid_or_missing_parameter = "🤬 Invalid or missing parameter : ",
  Invalid_request = "Invalid_Request 🤬",
  Detail_add_successfully = "Detail Added Successfully 😀",
  Your_subscriptions_is_over = "Your Subscriptions is over 🤬",
  Request_process_successfully = "Request Process Successfully 😀",
  Environment_variable_is_not_defined = "environment variable is not defined 🤬",
  Server_is_running_on_port = "😀 port",
  MongoDB_connection_error = "MongoDB connection error 🤬",
  Twilio_credentials_not_found = "Twilio credentials not found 🤬",
  Un_authorization_access = "Un Authorization ACCESS 🤬",
  Authorization_header_missing = "Authorization header missing 🤬",
  Middleware_error = "Middleware error 🤬",
  Add_stript_key = "Add stripe key 🤬",
  Invalid_subscriptionTypes = "Invalid subscriptionTypes 🤬",
  Invalide_price_interval = "Invalide price interval 🤬",
  Sms_send_successfully = "Sms send successfully 😀",
  Envalide_subscription = "Envalide subscription 🤬",
  Envalide_priceId = "Envalide priceId 🤬",
}

export enum STATUS {
  True = 1,
  False = 0,
}

export enum STATUS_CODE {
  SUCCESS = 200,
  ERROR = 500,
}

export enum JWT {
  user = "user",
  services = "services",
  admin = "admin",
}

export enum TYPE_OF_USER {
  USER = 1,
  SERVICES = 2,
  ADMIN = 3,
}

export enum ROUTES {
  User_without_login = "auth",
  User_services_access = "accessServiceRoutes",
  Admin_services_access = "admin",
  Images_access = "uploads",
  Stripe_access = "stripe",
}

export enum days {
  Daily = 1,
  Weekly = 7,
  Month = 30,
  Every_3_month = 90,
  Every_6_month = 180,
  Every_year = 365,
}

export enum subscriptionTypes {
  Daily = 1,
  Weekly = 2,
  Month = 3,
  Every_3_month = 4,
  Every_6_month = 5,
  Every_year = 6,
  subscription_start = 1,
  subscription_end = 6,
}

export enum intervals {
  Daily = "day",
  Weekly = "week",
  Month = "month",
  Every_3_month = "month_3",
  Every_6_month = "month_6",
  Every_year = "year",
}

export enum interval_count {
  Every_3_month = 3,
  Every_6_month = 6,
}
