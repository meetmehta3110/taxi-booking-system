export enum SERVICES {
  Twillo = 1,
  Whatsapp = 2,
  Payment = 3,
  Min_services = 1,
  Max_services = 1,
  Inc_Usage = 1,
}

export enum code {
  Registration_successfully = 1,
  Email_already_exists = 2,
  Phone_already_exists = 3,
  Internal_server_error = 4,
  User_not_found = 5,
  Login_successful = 6,
  Youre_unapproved = 7,
  Invalid_password = 8,
  Invalid_or_missing_parameter = 9,
  Right_parameter = 9,
  Invalid_request = 10,
  Detail_add_successfully = 11,
  Your_subscriptions_is_over = 12,
  Request_process_successfully = 13,
  Twilio_credentials_not_found = 17,
  Un_authorization_access = 18,
  Authorization_header_missing = 19,
  Middleware_error = 20,
  Add_stript_key = 21,
  Invalid_subscriptionTypes = 22,
  Invalide_price_interval = 23,
  Sms_send_successfully = 24,
  Envalide_subscription = 25,
  Envalide_priceId = 26,
  Card_deleted = 27,
  change_defaul_card = 28,
  Error_fetching_cards_for_customer = 29,
  Subscription_Buy_Successfully = 30,
  Pleace_add_card_first = 31,
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
  languages_access = "language",
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

export enum server_log {
  User_not_found = "Environment variable is not defined ",
  Environment_variable_is_not_defined = "User not found ",
  Server_is_running_on_port = "Port ",
  MongoDB_connection_error = "MongoDB connection error ",
  Envalide_subscription = "Envalide subscription ",
  Envalide_priceId = "Envalide priceId ",
  Add_stript_key = "Add stripe key ",
  Request_URL = "Request URL:",
  Internal_server_error = "Internal server error",
}

export enum message_db {
  Sms_send_successfully = "Sms send successfully ",
  Your_subscriptions_is_over = "Your Subscriptions is over ",
}
