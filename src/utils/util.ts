import { Request } from "../modules/Location/models/request.model";
import {
  UserSubscription,
  UserSubscriptionDocument,
} from "../modules/Location/models/userSubscription.model";
import { Subscription } from "../modules/Location/models/subscription.model";
import { Admin } from "../modules/Location/models/admin.model";
import {
  subscriptionTypes,
  days,
  STATUS,
  server_log,
} from "../constants/constant";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import {
  Setting,
  SettingnDocument,
} from "../modules/Location/models/setting.model";
// Load environment variables from .env file
dotenv.config({ path: "../../env/.env" });
import os from "os";
import multer from "multer";
import path from "path";
import { ObjectId } from "mongodb";
import { error } from "console";
export async function addIntoRequest(add: any): Promise<void> {
  const newReq = new Request(add);
  await newReq.save();
}

export async function checkSubscriptions(
  uid: string,
  productId: string
): Promise<number> {
  let filter = [
    {
      $match: {
        $expr: {
          $and: [
            { $lt: ["$usedLimit", "$maxLimit"] },
            { $eq: ["$userId", ObjectId.createFromHexString(uid)] }, // Use this if not work new ObjectId(uid)
            { $eq: ["$productId", ObjectId.createFromHexString(productId)] },
            { $lte: ["$startDate", new Date()] },
            { $gte: ["$endDate", new Date()] },
          ],
        },
      },
    },
  ];

  const subscriptions = await UserSubscription.aggregate(filter);
  return subscriptions.length;
}

function getSubscriptionDay(subscriptionType: number): number {
  switch (subscriptionType) {
    case subscriptionTypes.Daily:
      return days.Daily;
    case subscriptionTypes.Weekly:
      return days.Weekly;
    case subscriptionTypes.Month:
      return days.Month;
    case subscriptionTypes.Every_3_month:
      return days.Every_3_month;
    case subscriptionTypes.Every_6_month:
      return days.Every_6_month;
    case subscriptionTypes.Every_year:
      return days.Every_year;
    default:
      return 0;
  }
}

export async function buySubscription(
  uid: string,
  sid: string
): Promise<number> {
  const subscriptions = await Subscription.findOne({ _id: sid });
  if (!subscriptions) {
    return 0;
  }

  let day = getSubscriptionDay(subscriptions.subscriptionType);

  let startDate = new Date();
  let endDate = new Date();
  endDate.setDate(endDate.getDate() + day);

  let add: any[] = [];

  const promises = subscriptions.service.map(async (subscription: any) => {
    const status: UserSubscriptionDocument | null =
      await UserSubscription.findOne({
        productId: subscription.productId,
        userId: uid,
      });

    if (status) {
      await updateSubscriptionToUserTable(status, subscription, day);
    } else {
      const temp = await addSubscriptionToUserTable(
        uid,
        subscription.productId,
        subscription.requestLimit,
        startDate,
        endDate
      );

      add.push(temp);
    }
  });

  await Promise.all(promises);
  await UserSubscription.insertMany(add);
  return 1;
}

export async function updateSubscriptionToUserTable(
  data: UserSubscriptionDocument,
  serviceData: any,
  day: number
): Promise<number> {
  let endDate = new Date(data.endDate);
  endDate.setDate(endDate.getDate() + day);
  data.maxLimit += serviceData.requestLimit;
  data.endDate = endDate;
  data.save();
  return 1;
}

export async function addSubscriptionToUserTable(
  uid: string,
  productId: any,
  maxLimit: number,
  startDate: Date,
  endDate: Date
): Promise<object> {
  return {
    userId: uid,
    productId,
    usedLimit: 0,
    maxLimit: maxLimit,
    startDate,
    endDate,
  };
}

export async function add_default_admin() {
  const admin = await Admin.find({});

  if (admin.length == 0) {
    const { username, email, password, phone, phoneCode, isApprove } =
      process.env; //if your username is set in globle env they first take from it
    console.log({
      default_admin_Detail: {
        username,
        email,
        password,
        phone,
        phoneCode,
      },
    });
    const hashedPassword = await bcrypt.hash(password ?? "123456", 10);
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      phone,
      phoneCode,
      isApprove,
    });
    newAdmin.save();
  }
}

function getServerIPAddress(): string | undefined {
  const ifaces = os.networkInterfaces();
  let ipAddress: string | undefined;

  // Loop through all network interfaces
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname]?.forEach((iface) => {
      // Filter out internal and IPv6 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        ipAddress = iface.address;
      }
    });
  });

  return ipAddress;
}

export async function add_default_setting_detail() {
  const setting = await Setting.find({});
  const serverIPAddress = getServerIPAddress();
  if (setting.length == 0) {
    const {
      PORT,
      PROTOCOL,
      DEFAULT_IMAGE_FOLDER,
      PAYMENT_SUCCESS_URL,
      PAYMENT_CANCEL_URL,
    } = process.env;
    const newSetting = new Setting({
      port: PORT,
      serverUrl: serverIPAddress,
      protocol: PROTOCOL,
      defaulImageFolder: DEFAULT_IMAGE_FOLDER,
      paymentSuccessUrl: PAYMENT_SUCCESS_URL,
      paymentCancelUrl: PAYMENT_CANCEL_URL,
    });
    newSetting.save();
  }
}

export async function initialData(): Promise<number> {
  await add_default_admin();
  await add_default_setting_detail();
  return 1;
}

interface StripeAddProductResponse {
  status: number;
  id: string; // You can specify a more specific type if you know the structure of the 'product' object
}

export async function stripe_add_product(
  name: string,
  filepath: string
): Promise<StripeAddProductResponse> {
  const setting: SettingnDocument | null = await Setting.findOne({});
  if (setting && setting.stripe_secret_key != "") {
    const stripe = require("stripe")(setting.stripe_secret_key);

    const product = await stripe.products.create({
      name,
      images: [
        `${setting.protocol}://${setting.serverUrl}:${setting.port}/${setting.defaulImageFolder}/${filepath}`,
      ],
    });
    return { status: STATUS.True, id: product.id };
  } else {
    return { status: STATUS.False, id: "" };
  }
}

export async function stripe_update_product(
  productId: string,
  update: object
): Promise<StripeAddProductResponse> {
  const setting: SettingnDocument | null = await Setting.findOne({});
  if (setting && setting.stripe_secret_key != "") {
    const stripe = require("stripe")(setting.stripe_secret_key);

    const product = await stripe.products.update(productId, update);
    return { status: STATUS.True, id: product.id };
  } else {
    return { status: STATUS.False, id: "" };
  }
}

if (!process.env.DEFAULT_IMAGE_FOLDER) {
  throw new Error(
    `DEFAULT_IMAGE_FOLDER  ${server_log.Environment_variable_is_not_defined}`
  );
}

const DEFAULT_IMAGE_FOLDER = process.env.DEFAULT_IMAGE_FOLDER;

const uploadDir = path.join(__dirname, "..", DEFAULT_IMAGE_FOLDER);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filePath = Date.now() + file.originalname;
    req.body.filePath = filePath;
    cb(null, filePath);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB limit
  },
});

export async function stripe_remoce_product(
  productId: string
): Promise<StripeAddProductResponse> {
  const setting: SettingnDocument | null = await Setting.findOne({});
  if (setting && setting.stripe_secret_key != "") {
    const stripe = require("stripe")(setting.stripe_secret_key);

    const product = await stripe.products.del(productId);
    return { status: STATUS.True, id: product.id };
  } else {
    return { status: STATUS.False, id: "" };
  }
}

export async function stripe_add_price(
  productId: string,
  unit_amount: number,
  currency: string,
  recurring: object
): Promise<StripeAddProductResponse> {
  const setting: SettingnDocument | null = await Setting.findOne({});
  if (setting && setting.stripe_secret_key != "") {
    const stripe = require("stripe")(setting.stripe_secret_key);

    const price = await stripe.prices.create({
      product: productId,
      unit_amount,
      currency,
      recurring,
    });
    console.log(price);

    return { status: STATUS.True, id: price.id };
  } else {
    return { status: STATUS.False, id: "" };
  }
}

export async function getAllCards(customerId: string) {
  try {
    const setting: SettingnDocument | null = await Setting.findOne({});
    if (!setting) {
      throw error(server_log.Add_stript_key);
    }
    const stripe = require("stripe")(setting.stripe_secret_key);

    const customer = await stripe.customers.retrieve(customerId, {
      expand: ["sources.data"],
    });

    const cards = customer.sources.data.filter(
      (source: any) => source.object === "card"
    );
    return cards;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteCard(customerId: string, cardId: string) {
  try {
    const setting: SettingnDocument | null = await Setting.findOne({});
    if (!setting) {
      throw error(server_log.Add_stript_key);
    }
    const stripe = require("stripe")(setting.stripe_secret_key);

    const deletedCard = await stripe.customers.deleteSource(customerId, cardId);

    return deletedCard;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

export async function changeDefaultCard(customerId: string, newCardId: string) {
  const setting: SettingnDocument | null = await Setting.findOne({});
  if (!setting) {
    throw error(server_log.Add_stript_key);
  }
  const stripe = require("stripe")(setting.stripe_secret_key);

  await stripe.customers.update(customerId, {
    default_source: newCardId,
  });
}

export async function addTestCardToCustomer(customerId: string, token: any) {
  try {
    const setting: SettingnDocument | null = await Setting.findOne({});
    if (!setting) {
      throw error(server_log.Add_stript_key);
    }
    const stripe = require("stripe")(setting.stripe_secret_key);

    const source = await stripe.customers.createSource(customerId, {
      source: "tok_visa",
    });
    return source;
  } catch (error) {
    console.log(server_log.Internal_server_error, error);
    throw error;
  }
}
